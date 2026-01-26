import pandas as pd
import numpy as np
import random
from pathlib import Path
from django.conf import settings
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# --- 서비스 로직 임포트 ---
from .services.recommendations import recommend_for_user, popular_products
from .services.recommendations_batch import rebuild_usercf_recommendations_from_csv

# 1. 개인 맞춤 추천 조회 API
def get_user_specific_recommendations(request, user_id):
    """
    특정 유저를 위한 하이브리드 추천 결과 반환
    """
    limit = request.GET.get('limit', 5)
    results = recommend_for_user(user_id, int(limit))
    return JsonResponse({"user_id": user_id, "recommendations": results})

# 2. 범용 및 종별 인기 추천 API
def get_popular_recommendations(request, species=None):
    """
    전체 인기 상품 또는 특정 종 인기 상품 반환
    """
    limit = request.GET.get('limit', 10)
    results = popular_products(int(limit))
    return JsonResponse({"species": species if species else "all", "recommendations": results})

# 3. 카테고리별 추천 API
def get_category_recommendations(request, category_id):
    """
    특정 카테고리 내 인기 상품 반환
    """
    return JsonResponse({"category_id": category_id, "recommendations": []})

# 4. 관리자용: AI 추천 엔진 수동 갱신 (핵심 로직 수정본)
@csrf_exempt
def trigger_recommendation_rebuild(request):
    """
    [User: kosmo] 하이브리드 추천 엔진 갱신
    DB 스키마에 따라 et_user 대신 et_pet의 species 컬럼을 사용합니다.
    """
    # 랜덤 시드 고정 (재현성 확보)
    random.seed(1)
    np.random.seed(1)
    
    # 가중치 설정
    SPECIES_MATCH_SCORE = 60.0 
    RATING_WEIGHT = 5.0
    BUY_WEIGHT = 10.0
    
    project_root = Path(settings.BASE_DIR).parent
    log_dir = project_root / "logs"
    csv_path = log_dir / "service_ready_data.csv"

    try:
        # 로그 폴더 생성
        log_dir.mkdir(parents=True, exist_ok=True)

        with connection.cursor() as cursor:
            # (1) 구매 데이터 추출: et_order_item 및 SKU 조인
            cursor.execute("""
                SELECT 
                    o.user_id, ps.product_id, CAST(COUNT(oi.order_item_id) AS UNSIGNED) AS buy_score
                FROM et_order o
                JOIN et_order_item oi ON o.order_id = oi.order_id
                JOIN et_product_sku ps ON oi.sku_id = ps.sku_id
                GROUP BY o.user_id, ps.product_id
            """)
            df_order = pd.DataFrame(cursor.fetchall(), columns=['user_id', 'product_id', 'buy_score'])

            # (2) 리뷰 데이터 추출
            cursor.execute("SELECT user_id, product_id, rating FROM et_product_review WHERE deleted_at IS NULL")
            df_review = pd.DataFrame(cursor.fetchall(), columns=['user_id', 'product_id', 'rating'])

            # (3) 프로필 매칭 [수정]: et_pet 테이블의 species 컬럼 사용
            # et_user에는 펫 정보가 없으므로 et_pet과 LEFT JOIN 합니다.
            cursor.execute("""
                SELECT 
                    u.user_id, p.product_id,
                    -- 유저의 펫(et_pet) 종과 카테고리 이름 매칭
                    (CASE WHEN c.name LIKE CONCAT('%', IFNULL(pet.species, ''), '%') THEN 1 ELSE 0 END) as species_match
                FROM et_user u
                CROSS JOIN et_product p
                JOIN et_category c ON p.category_id = c.category_id
                LEFT JOIN et_pet pet ON u.user_id = pet.user_id
                WHERE p.deleted_at IS NULL
            """)
            df_profile = pd.DataFrame(cursor.fetchall(), columns=['user_id', 'product_id', 'species_match'])

        # 데이터 병합
        df_all = pd.merge(df_profile, df_order, on=["user_id", "product_id"], how="left")
        df_all = pd.merge(df_all, df_review, on=["user_id", "product_id"], how="left").fillna(0)

        # 하이브리드 점수 계산 (detail_match는 스키마에 없어 제외하거나 0으로 처리)
        df_all["raw_score"] = (
            (df_all['buy_score'] * BUY_WEIGHT) + 
            (df_all['rating'] * RATING_WEIGHT) + 
            (df_all['species_match'] * SPECIES_MATCH_SCORE)
        )

        # 정규화 및 저장
        df_all = df_all[df_all["raw_score"] > 0]
        if not df_all.empty:
            max_s, min_s = df_all["raw_score"].max(), df_all["raw_score"].min()
            if max_s != min_s:
                df_all["final_preference"] = ((df_all["raw_score"] - min_s) / (max_s - min_s)) * 100
            else:
                df_all["final_preference"] = 100.0
            
            df_all["final_preference"] = df_all["final_preference"].round(2)
            
            # CSV 저장
            df_all[["user_id", "product_id", "final_preference"]].to_csv(csv_path, index=False, encoding='utf-8-sig')
            
            # User-CF 엔진 실행 (rebuild_usercf_recommendations_from_csv는 CSV를 읽어 DB에 저장함)
            recos_count = rebuild_usercf_recommendations_from_csv(csv_path, top_n=10)
            
            return JsonResponse({
                "status": "success", 
                "message": f"KOSMO 엔진 업데이트 완료 ({recos_count}건 생성)"
            })
        else:
            return JsonResponse({"status": "error", "message": "추천을 생성할 기초 데이터(구매/리뷰/펫정보)가 부족합니다."}, status=400)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
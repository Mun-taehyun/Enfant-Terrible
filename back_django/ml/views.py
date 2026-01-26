import random
import numpy as np
import pandas as pd
import glob
import os
from pathlib import Path
from django.conf import settings
from django.db import connection
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt  # CSRF 면제를 위해 추가

# 서비스 로직 임포트
from .services.recommendations_batch import rebuild_usercf_recommendations_from_csv
from .services.recommendations import recommend_for_user, popular_products

# 1. 특정 사용자 맞춤 추천 조회 (GET /api/recommendations/<int:user_id>/)
def recommendation(request, user_id):
    """
    특정 사용자의 맞춤 추천 상품 목록을 반환하는 API
    """
    limit = request.GET.get('limit', 5)
    try:
        # services/recommendations.py의 함수 호출
        results = recommend_for_user(int(user_id), int(limit))
        
        return JsonResponse({
            "status": "success",
            "user_id": user_id,
            "results": results
        }, status=200)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 2. 전체 인기 상품 조회 (GET /api/recommendations/popular/)
def popular_recommendation_view(request):
    """
    개인화 데이터가 없을 때 사용하는 인기 상품 목록 반환 API
    """
    limit = request.GET.get('limit', 10)
    try:
        results = popular_products(int(limit))
        return JsonResponse({
            "status": "success",
            "results": results
        }, status=200)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 3. 관리자용 추천 엔진 강제 업데이트 (POST/GET /api/admin/recommendation/update/)
# Spring Boot 서버의 호출을 허용하기 위해 @csrf_exempt 추가
@csrf_exempt
def admin_recommendation_update(request):
    # 랜덤 시드 고정 (사용자 요청 반영: 시드 1)
    random.seed(1)
    np.random.seed(1)
    
    RATING_WEIGHT = 2.0  # 리뷰 평점 가중치
    VIEW_WEIGHT = 0.1    # 조회 로그 가중치
    
    # settings.py의 경로 설정 활용
    project_root = Path(settings.BASE_DIR).parent
    # logs 폴더 또는 ai_analysis 경로 확인
    log_dir = project_root / "logs"
    csv_path = log_dir / "service_ready_data.csv"

    try:
        if not log_dir.exists():
            log_dir.mkdir(parents=True, exist_ok=True)

        with connection.cursor() as cursor:
            # 주문 데이터 추출
            cursor.execute("""
                SELECT 
                    o.user_id, 
                    ps.product_id, 
                    CAST(SUM(COALESCE(oi.quantity, 1)) AS UNSIGNED) AS buy_score
                FROM et_order_item oi
                JOIN et_order o ON o.order_id = oi.order_id
                JOIN et_product_sku ps ON ps.sku_id = oi.sku_id
                JOIN et_product p ON p.product_id = ps.product_id
                WHERE o.order_status IN ('PAID', 'SHIPPING', 'DELIVERED')
                  AND p.deleted_at IS NULL
                GROUP BY o.user_id, ps.product_id
            """)
            df_order = pd.DataFrame(cursor.fetchall(), columns=['user_id', 'product_id', 'buy_score'])

            # 리뷰 데이터 추출
            cursor.execute("""
                SELECT user_id, product_id, rating 
                FROM et_product_review 
                WHERE deleted_at IS NULL
            """)
            df_review = pd.DataFrame(cursor.fetchall(), columns=['user_id', 'product_id', 'rating'])

        df_order = df_order.astype({'user_id': 'int64', 'product_id': 'int64'})
        df_review = df_review.astype({'user_id': 'int64', 'product_id': 'int64'})

        # 데이터 병합 및 선호도 계산
        df_db = pd.merge(df_order, df_review, on=["user_id", "product_id"], how="outer").fillna(0)

        # 활동 로그 통합
        view_logs = []
        log_files = glob.glob(str(log_dir / "product_view_*.csv"))
        
        for f in log_files:
            try:
                temp_df = pd.read_csv(f)
                temp_df.columns = [c.lower() for c in temp_df.columns]
                temp_df = temp_df.rename(columns={'productid': 'product_id', 'userid': 'user_id'})
                
                if 'user_id' in temp_df.columns and 'product_id' in temp_df.columns:
                    temp_df = temp_df.dropna(subset=['user_id', 'product_id'])
                    temp_df = temp_df.astype({'user_id': 'int64', 'product_id': 'int64'})
                    view_logs.append(temp_df[['user_id', 'product_id']])
            except Exception as e:
                print(f"⚠️ 로그 파일 처리 스킵 ({f}): {e}")

        if view_logs:
            df_views = pd.concat(view_logs, ignore_index=True)
            df_view_counts = df_views.groupby(['user_id', 'product_id']).size().reset_index(name='view_count')
            final_df = pd.merge(df_db, df_view_counts, on=['user_id', 'product_id'], how='outer').fillna(0)
            
            final_df["final_preference"] = (
                final_df["buy_score"] + 
                (final_df["rating"] * RATING_WEIGHT) + 
                (final_df["view_count"] * VIEW_WEIGHT)
            )
        else:
            final_df = df_db
            final_df["final_preference"] = final_df["buy_score"] + (final_df["rating"] * RATING_WEIGHT)

        final_df = final_df[final_df["final_preference"] > 0]
        if final_df.empty:
            return JsonResponse({"status": "warn", "message": "추천을 생성할 활동 데이터가 없습니다."}, status=200)

        # CSV 저장 및 엔진 가동
        final_df[["user_id", "product_id", "final_preference"]].to_csv(csv_path, index=False, encoding='utf-8-sig')
        recos_count = rebuild_usercf_recommendations_from_csv(csv_path, top_n=10)
        
        return JsonResponse({
            "status": "success", 
            "message": "추천 데이터 갱신 완료",
            "data_summary": {
                "total_interactions": len(final_df),
                "recommendations_created": recos_count
            },
            "updated_at": timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        })

    except Exception as e:
        return JsonResponse({"status": "error", "message": f"서버 오류: {str(e)}"}, status=500)
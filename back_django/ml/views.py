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

# 추천 엔진 함수 임포트 (이전에 수정한 rebuild_usercf_recommendations_from_csv 사용)
from .services.recommendations_batch import rebuild_usercf_recommendations_from_csv

def admin_recommendation_update(request):
    # 1. [개인화] 환경 설정 및 시드 고정
    random.seed(1)
    np.random.seed(1)
    
    RATING_WEIGHT = 2.0  # 리뷰 평점 가중치
    VIEW_WEIGHT = 0.1    # 조회 로그 가중치
    
    # 경로 설정
    project_root = Path(settings.BASE_DIR).parent
    log_dir = project_root / "logs"
    csv_path = log_dir / "service_ready_data.csv"

    try:
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        with connection.cursor() as cursor:
            # 2. DB에서 주문 데이터 추출 (스키마 대응)
            # - order_status: 'PAID', 'SHIPPING', 'DELIVERED' 등 유효 주문만 포함
            # - deleted_at: 삭제되지 않은 상품만 포함
            cursor.execute("""
                SELECT 
                    o.user_id, 
                    ps.product_id, 
                    SUM(COALESCE(oi.quantity, 1)) AS buy_score
                FROM et_order_item oi
                JOIN et_order o ON o.order_id = oi.order_id
                JOIN et_product_sku ps ON ps.sku_id = oi.sku_id
                JOIN et_product p ON p.product_id = ps.product_id
                WHERE o.order_status IN ('PAID', 'SHIPPING', 'DELIVERED')
                  AND p.deleted_at IS NULL
                GROUP BY o.user_id, ps.product_id
            """)
            df_order = pd.DataFrame(cursor.fetchall(), columns=['user_id', 'product_id', 'buy_score'])

            # 3. DB에서 리뷰 데이터 추출 (삭제되지 않은 리뷰만)
            cursor.execute("""
                SELECT user_id, product_id, rating 
                FROM et_product_review 
                WHERE deleted_at IS NULL
            """)
            df_review = pd.DataFrame(cursor.fetchall(), columns=['user_id', 'product_id', 'rating'])

        # 4. DB 데이터 병합
        df_db = pd.merge(df_order, df_review, on=["user_id", "product_id"], how="outer").fillna(0)

        # 5. 활동 로그(CSV) 통합 (조회수 기반 점수)
        view_logs = []
        log_files = glob.glob(str(log_dir / "product_view_*.csv"))
        
        for f in log_files:
            try:
                temp_df = pd.read_csv(f)
                # 컬럼명 정규화 (낙타 표기법 -> 스네이크 표기법)
                temp_df = temp_df.rename(columns={'productId': 'product_id', 'userId': 'user_id', 'user_id': 'user_id'})
                if 'user_id' in temp_df.columns and 'product_id' in temp_df.columns:
                    view_logs.append(temp_df[['user_id', 'product_id']])
            except Exception:
                continue

        # 6. 가중치 기반 최종 선호도(Preference) 계산
        if view_logs:
            df_views = pd.concat(view_logs)
            df_view_counts = df_views.groupby(['user_id', 'product_id']).size().reset_index(name='view_count')
            final_df = pd.merge(df_db, df_view_counts, on=['user_id', 'product_id'], how='outer').fillna(0)
            
            # 최종 점수 공식: 구매량 + (평점 * 가중치) + (조회수 * 가중치)
            final_df["final_preference"] = (
                final_df["buy_score"] + 
                (final_df["rating"] * RATING_WEIGHT) + 
                (final_df["view_count"] * VIEW_WEIGHT)
            )
        else:
            final_df = df_db
            final_df["final_preference"] = final_df["buy_score"] + (final_df["rating"] * RATING_WEIGHT)

        # 7. 데이터 정제 및 저장
        # - 평점이 없거나 활동이 없는 데이터 제외
        # - 유효한 유저/상품 ID만 필터링 (정수형 변환)
        final_df = final_df[final_df["final_preference"] > 0]
        final_df = final_df.astype({'user_id': 'int64', 'product_id': 'int64'})
        
        # ML 엔진에 공급할 CSV 저장
        final_df[["user_id", "product_id", "final_preference"]].to_csv(
            csv_path, index=False, encoding='utf-8-sig'
        )
        
        # 8. 실시간 추천 엔진 재학습 및 DB(et_user_recommendation) 업데이트
        recos_count = rebuild_usercf_recommendations_from_csv(csv_path, top_n=10)
        
        return JsonResponse({
            "status": "success", 
            "message": "데이터 통합 및 유저 협업 필터링 추천 갱신 완료",
            "processed_logs": len(view_logs),
            "recommendations_created": recos_count,
            "updated_at": timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        })

    except Exception as e:
        return JsonResponse({"status": "error", "message": f"오류 발생: {str(e)}"}, status=500)
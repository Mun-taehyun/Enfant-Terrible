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

# 추천 엔진 함수 (사용자님의 경로에 맞춰 임포트)
from .services.recommendations_batch import rebuild_usercf_recommendations_from_csv

def admin_recommendation_update(request):
    # 1. 시드 고정 및 설정
    random.seed(1)
    np.random.seed(1)
    
    RATING_WEIGHT = 2.0  # 리뷰 평점 가중치
    VIEW_WEIGHT = 0.1    # 조회 로그 가중치
    
    project_root = Path(settings.BASE_DIR).parent
    log_dir = project_root / "logs"
    csv_path = log_dir / "service_ready_data.csv"

    try:
        if not log_dir.exists():
            log_dir.mkdir(parents=True, exist_ok=True)

        with connection.cursor() as cursor:
            # 2. 주문 데이터 추출 (유효 주문만)
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

            # 3. 리뷰 데이터 추출
            cursor.execute("""
                SELECT user_id, product_id, rating 
                FROM et_product_review 
                WHERE deleted_at IS NULL
            """)
            df_review = pd.DataFrame(cursor.fetchall(), columns=['user_id', 'product_id', 'rating'])

        # ID 타입을 정수로 강제 변환 (병합 오류 방지)
        df_order = df_order.astype({'user_id': 'int64', 'product_id': 'int64'})
        df_review = df_review.astype({'user_id': 'int64', 'product_id': 'int64'})

        # 4. DB 데이터 병합
        df_db = pd.merge(df_order, df_review, on=["user_id", "product_id"], how="outer").fillna(0)

        # 5. 활동 로그(CSV) 통합
        view_logs = []
        log_files = glob.glob(str(log_dir / "product_view_*.csv"))
        
        for f in log_files:
            try:
                temp_df = pd.read_csv(f)
                # 컬럼명 유연하게 대응
                temp_df.columns = [c.lower() for c in temp_df.columns] # 소문자 통일
                temp_df = temp_df.rename(columns={'productid': 'product_id', 'userid': 'user_id'})
                
                if 'user_id' in temp_df.columns and 'product_id' in temp_df.columns:
                    # null 값 제거 및 정수 변환
                    temp_df = temp_df.dropna(subset=['user_id', 'product_id'])
                    temp_df = temp_df.astype({'user_id': 'int64', 'product_id': 'int64'})
                    view_logs.append(temp_df[['user_id', 'product_id']])
            except Exception as e:
                print(f"⚠️ 로그 파일 처리 스킵 ({f}): {e}")
                continue

        # 6. 최종 선호도 계산
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

        # 7. 데이터 정제 및 저장
        final_df = final_df[final_df["final_preference"] > 0]
        if final_df.empty:
            return JsonResponse({"status": "warn", "message": "추천을 생성할 활동 데이터가 없습니다."}, status=200)

        final_df = final_df.astype({'user_id': 'int64', 'product_id': 'int64'})
        
        # ML 공급용 CSV 저장
        final_df[["user_id", "product_id", "final_preference"]].to_csv(
            csv_path, index=False, encoding='utf-8-sig'
        )
        
        # 8. 추천 엔진 가동
        recos_count = rebuild_usercf_recommendations_from_csv(csv_path, top_n=10)
        
        return JsonResponse({
            "status": "success", 
            "message": "추천 데이터 갱신 완료",
            "data_summary": {
                "processed_logs": len(view_logs),
                "total_interactions": len(final_df),
                "recommendations_created": recos_count
            },
            "updated_at": timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        })

    except Exception as e:
        import traceback
        print(traceback.format_exc()) # 서버 로그에서 상세 에러 확인용
        return JsonResponse({"status": "error", "message": f"서버 오류: {str(e)}"}, status=500)
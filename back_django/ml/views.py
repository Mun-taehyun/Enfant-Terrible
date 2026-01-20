import random
import numpy as np
import pandas as pd
from pathlib import Path
from django.db import connection
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt

from ml.auth import get_user_id_from_request
from ml.services.recommendations import recommend_for_user
from ml.services.recommendations_batch import rebuild_usercf_recommendations_from_csv

# [기존 기능] 추천 데이터 조회
@require_GET
def recommendation(request):
    try:
        limit = int(request.GET.get("limit", "5"))
    except ValueError:
        limit = 5
    limit = max(1, min(limit, 50))

    user_id = get_user_id_from_request(request)
    if user_id is None:
        return JsonResponse({"detail": "Unauthorized"}, status=401)
    
    recommendations = recommend_for_user(user_id, limit)
    return JsonResponse({
        "userId": user_id,
        "recommendations": recommendations,
    })

# [신규 기능] 버튼 클릭 시 협업 필터링 실행
@csrf_exempt
@require_POST
def admin_recommendation_update(request):
    # 랜덤 시드 1 고정 (요청 사항)
    random.seed(1)
    np.random.seed(1)

    try:
        # 1. CSV 저장 경로 설정 (ml/data/ 폴더)
        data_dir = Path(settings.BASE_DIR) / "ml" / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        csv_path = data_dir / "user_preferences.csv"

        # 2. DB에서 최신 데이터 추출 (방금 테스트 성공한 쿼리)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    o.user_id, 
                    ps.product_id, 
                    COUNT(*) as final_preference
                FROM et_order_item oi
                JOIN et_order o ON oi.order_id = o.order_id
                JOIN et_product_sku ps ON oi.sku_id = ps.sku_id
                WHERE o.deleted_at IS NULL
                GROUP BY o.user_id, ps.product_id
            """)
            rows = cursor.fetchall()
            
            # DataFrame으로 변환 후 CSV 저장
            df = pd.DataFrame(rows, columns=['user_id', 'product_id', 'final_preference'])
            df.to_csv(csv_path, index=False)

        # 3. 배치 함수 실행 (rebuild_usercf_recommendations_from_csv)
        count = rebuild_usercf_recommendations_from_csv(
            csv_path=csv_path,
            top_n=5,
            similar_k=10,
            truncate=True
        )
        
        return JsonResponse({
            "status": "success",
            "message": f"협업 필터링 업데이트 완료! ({count}건의 추천 생성됨)",
            "user": "enfant"
        })
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
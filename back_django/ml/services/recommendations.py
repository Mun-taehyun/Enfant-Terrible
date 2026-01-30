import os
import sys
from pathlib import Path

# --- 1. 환경 설정 (Django 연동) ---
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent.parent 
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.db import connection
from ml.models import UserRecommendation 

def popular_products(limit: int):
    """판매량(70) + 평점(30) 기반 인기 상품 추천 (Cold Start 방지용)"""
    limit = max(1, min(int(limit), 50))
    try:
        with connection.cursor() as c:
            c.execute("""
                SELECT 
                    p.product_id, 
                    (LEAST(COUNT(oi.order_item_id) * 10, 70) + COALESCE(p.average_rating, 0) * 6) AS score
                FROM et_product p
                LEFT JOIN et_product_sku ps ON p.product_id = ps.product_id
                LEFT JOIN et_order_item oi ON ps.sku_id = oi.sku_id
                WHERE p.deleted_at IS NULL AND p.status = 'ON_SALE'
                GROUP BY p.product_id, p.average_rating
                ORDER BY score DESC, p.product_id DESC
                LIMIT %s
            """, [limit])
            rows = c.fetchall()
            return [{"productId": int(r[0]), "score": round(float(r[1]), 2)} for r in rows]
    except Exception as e:
        print(f"⚠️ Popular products error: {e}")
        return []

def recommend_for_user(user_id: int, limit: int = 5):
    """사용자 맞춤형 추천 (데이터 없으면 인기 상품 반환)"""
    try:
        # 1. 개인화 추천 테이블 조회
        recos = list(
            UserRecommendation.objects.filter(user_id=user_id)
            .order_by('rank_no', '-score')
            .values_list('product_id', 'score')[:limit]
        )
        
        if recos:
            return [{"productId": int(r[0]), "score": round(float(r[1]), 2)} for r in recos]
            
    except Exception as e:
        print(f"⚠️ Recommendation query error: {e}")
    
    # 2. 추천 데이터가 없는 경우 인기 상품으로 대체
    return popular_products(limit)

if __name__ == "__main__":
    # 테스트 실행
    uid = 1
    results = recommend_for_user(uid, 5)
    
    print(f"\n🔍 유저 {uid}번 추천 결과:")
    for idx, item in enumerate(results, 1):
        print(f"  {idx}위. 상품ID: {item['productId']:>3} | 점수: {item['score']:>6.2f}")
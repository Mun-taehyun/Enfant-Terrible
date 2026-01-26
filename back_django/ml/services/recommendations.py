import os
import sys
from pathlib import Path

# --- 1. 경로 설정 (ModuleNotFoundError: No module named 'config' 해결) ---
# 현재 파일: back_django/ml/services/recommendations.py
current_file = Path(__file__).resolve()
# 부모(services) -> 부모(ml) -> 부모(back_django)
project_root = current_file.parent.parent.parent 

if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root)) # 경로 맨 앞에 추가하여 우선순위 확보

# --- 2. Django 환경 설정 ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
try:
    django.setup()
    # print(f"✅ Django Setup Success! (DB: {django.conf.settings.DATABASES['default']['NAME']})")
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    sys.exit(1)

# --- 3. 모델 및 DB 모듈 임포트 (반드시 django.setup() 이후에 실행) ---
from django.db import connection
from ml.models import UserRecommendation

def popular_products(limit: int):
    """DB 기반 실시간 인기 상품 추출 (가중치: 판매량 70% + 평점 30%)"""
    limit = max(1, min(int(limit), 50))
    try:
        with connection.cursor() as c:
            c.execute("""
                SELECT p.product_id, 
                       (SUM(COALESCE(oi.quantity, 0)) * 0.7 + MAX(COALESCE(p.average_rating, 0)) * 2.0) AS score
                FROM et_product p
                LEFT JOIN et_product_sku ps ON p.product_id = ps.product_id
                LEFT JOIN et_order_item oi ON ps.sku_id = oi.sku_id
                WHERE p.deleted_at IS NULL AND p.status = 'ON_SALE'
                GROUP BY p.product_id
                ORDER BY score DESC, p.product_id DESC
                LIMIT %s
            """, [limit])
            rows = c.fetchall()
            return [{"productId": int(r[0]), "score": float(r[1])} for r in rows]
    except Exception as e:
        print(f"⚠️ Popular products error: {e}")
        return []

def recommend_for_user(user_id: int, limit: int = 5):
    """사용자 맞춤형 추천 (결과가 없으면 인기 상품 반환)"""
    try:
        # UserRecommendation 모델을 통한 데이터 조회
        recos = list(
            UserRecommendation.objects.filter(user_id=user_id)
            .order_by('rank_no', '-score')
            .values_list('product_id', 'score')[:limit]
        )
        
        if recos:
            return [{"productId": int(r[0]), "score": float(r[1])} for r in recos]
            
    except Exception as e:
        print(f"⚠️ Recommendation query error: {e}")
    
    # 맞춤 추천 데이터가 없으면 인기 상품으로 대체 (Fallback)
    return popular_products(limit)

if __name__ == "__main__":
    print("-" * 30)
    print("🚀 추천 엔진 단독 실행 테스트 가동...")
    # enfant 님의 user_id가 1번이라고 가정하고 테스트
    test_user_id = 1
    results = recommend_for_user(test_user_id, 5)
    
    print(f"🔍 유저 {test_user_id}번 추천 결과:")
    if results:
        for idx, item in enumerate(results, 1):
            print(f"  {idx}. 상품ID: {item['productId']} (점수: {item['score']:.2f})")
    else:
        print("  결과가 없습니다. DB 데이터를 확인하세요.")
    print("-" * 30)
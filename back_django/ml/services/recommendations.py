import os
import sys
from pathlib import Path

# --- 1. 경로 설정 ---
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent.parent 

if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# --- 2. Django 환경 설정 ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
try:
    django.setup()
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    sys.exit(1)

# --- 3. 모델 및 DB 모듈 임포트 ---
from django.db import connection
# 모델명이 et_user_recommendation 테이블과 매핑된 UserRecommendation인지 확인 필수
from ml.models import UserRecommendation 

def popular_products(limit: int):
    """
    [User: kosmo] 범용 인기 상품 추천 로직
    - 스키마 대응: et_order_item -> et_product_sku -> et_product 구조로 JOIN
    - 판매량(70점) + 평점(30점) 합산 방식
    """
    limit = max(1, min(int(limit), 50))
    try:
        with connection.cursor() as c:
            # [수정 완료] o.product_id 대신 JOIN을 통해 실제 상품 ID를 집계합니다.
            c.execute("""
                SELECT 
                    p.product_id, 
                    (
                      -- 판매량 점수: (해당 상품의 총 판매 건수) * 10점, 최대 70점
                      LEAST(COUNT(oi.order_item_id) * 10, 70) + 
                      -- 평점 점수: (상품 평균 평점) * 6점, 최대 30점
                      (COALESCE(p.average_rating, 0) * 6)
                    ) AS score
                FROM et_product p
                -- 상품 -> SKU -> 주문아이템 순으로 JOIN 하여 실제 판매량 확인
                LEFT JOIN et_product_sku ps ON p.product_id = ps.product_id
                LEFT JOIN et_order_item oi ON ps.sku_id = oi.sku_id
                WHERE p.deleted_at IS NULL 
                  AND p.status = 'ON_SALE'
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
    """
    사용자 맞춤형 추천 조회
    1. 개인화 추천 테이블(et_user_recommendation) 먼저 확인
    2. 데이터가 없으면(신규 유저 등) 인기 상품으로 Fallback
    """
    try:
        # Django ORM을 사용하여 추천 결과 조회
        recos = list(
            UserRecommendation.objects.filter(user_id=user_id)
            .order_by('rank_no', '-score')
            .values_list('product_id', 'score')[:limit]
        )
        
        if recos:
            return [{"productId": int(r[0]), "score": round(float(r[1]), 2)} for r in recos]
            
    except Exception as e:
        print(f"⚠️ Recommendation query error: {e}")
    
    # 맞춤 추천 데이터가 없는 경우(Cold Start) 인기 상품 반환
    return popular_products(limit)

if __name__ == "__main__":
    print("-" * 50)
    print("🚀 [User: kosmo] 하이브리드 추천 서빙 엔진 가동...")
    
    # 테스트 유저 1번 조회 (배치가 돌아갔다면 결과가 나오고, 안 돌아갔다면 인기상품이 나옴)
    test_user_id = 1
    results = recommend_for_user(test_user_id, 5)
    
    print(f"🔍 유저 {test_user_id}번 추천 결과 (100점 만점 기준):")
    if results:
        for idx, item in enumerate(results, 1):
            # score가 0인 경우는 아직 구매/리뷰 데이터가 아주 적은 상태임을 의미
            print(f"  {idx}위. 상품ID: {item['productId']:>3} | 매칭점수: {item['score']:>6.2f}점")
    else:
        print("  ❌ 결과가 없습니다. DB 마이그레이션 상태를 확인하세요.")
    print("-" * 50)
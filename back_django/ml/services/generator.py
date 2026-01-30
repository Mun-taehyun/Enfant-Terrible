import os
import sys
import pandas as pd
import numpy as np
import random
from datetime import datetime
from pathlib import Path

# --- Django 환경 초기화 ---
current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent 
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings') 
import django
django.setup()

from django.conf import settings

# [설정] 랜덤 시드 고정
np.random.seed(1)
random.seed(1)

def generate_kosmo_data(num_products=100, num_users=50):
    LOGS_PATH = Path(settings.BASE_DIR).parent / "logs"
    os.makedirs(LOGS_PATH, exist_ok=True)
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 1. 카테고리별 상품 키워드 정의
    items_meta = {
        '강아지': {
            '기능성 사료': ['그레인프리 연어 사료', '시니어 관절케어 사료'],
            '맛있는 간식': ['국내산 소고기 육포', '오리 안심 슬라이스'],
            '생활용품': ['마약 메모리폼 침대', '사계절 쿨매트'],
            '장난감': ['노즈워크 담요', '치실 밧줄 터그']
        },
        '고양이': {
            '기능성 사료': ['헤어볼 케어 사료', '무곡물 치킨&연어 사료'],
            '맛있는 간식': ['참치 가득 츄르', '연어 스테이크 트릿'],
            '생활용품': ['원목 5단 캣타워', '세라믹 자동 급수기'],
            '장난감': ['깃털 낚시대', '양면 스크래쳐']
        }
    }

    # 2. 카테고리 마스터 생성
    categories, cat_info = [], {}
    cat_id = 1
    for species, sub_cats in items_meta.items():
        categories.append({'category_id': cat_id, 'parent_id': None, 'name': species, 'depth': 1, 'sort_order': cat_id})
        parent_id = cat_id
        cat_id += 1
        for i, (sub_name, keywords) in enumerate(sub_cats.items()):
            categories.append({'category_id': cat_id, 'parent_id': parent_id, 'name': f"{species} {sub_name}", 'depth': 2, 'sort_order': i+1})
            cat_info[cat_id] = {'species': species, 'type': sub_name, 'keywords': keywords}
            cat_id += 1
    pd.DataFrame(categories).to_csv(LOGS_PATH / "category_master.csv", index=False, encoding='utf-8-sig')

    # 3. 상품 데이터 생성
    products, brands = [], ['앙팡', '테리블', '네이처팡', '퓨어펫']
    cat_ids = list(cat_info.keys())
    for i in range(1, num_products + 1):
        c_id = random.choice(cat_ids)
        info = cat_info[c_id]
        brand, keyword = random.choice(brands), random.choice(info['keywords'])
        price = random.randint(10, 100) * 1000
        
        products.append({
            'product_id': i, 'category_id': c_id, 'product_code': f"KOSMO-P-{i:03d}",
            'name': f"[{brand}] {keyword}", 'status': 'ON_SALE', 'base_price': price,
            'description': f"{brand}에서 제작한 {info['species']} 전용 {keyword}입니다.",
            'created_at': now, 'updated_at': now
        })
    pd.DataFrame(products).to_csv(LOGS_PATH / "product_master.csv", index=False, encoding='utf-8-sig')

    # 4. 펫 프로필 데이터 생성
    pets = []
    for i in range(1, num_users + 1):
        pets.append({
            'pet_id': i, 'user_id': i, 'name': f"우리집아이{i}",
            'species': random.choice(['강아지', '고양이']), 'age': random.randint(1, 15)
        })
    pd.DataFrame(pets).to_csv(LOGS_PATH / "pet_master.csv", index=False, encoding='utf-8-sig')

    # 5. 가공된 구매 이력 생성 (추천 엔진 학습용)
    orders = []
    for u_id in range(1, num_users + 1):
        # 유저당 3~8개의 상품을 랜덤하게 구매한 것으로 설정
        bought_count = random.randint(3, 8)
        bought_items = random.sample(range(1, num_products + 1), bought_count)
        for p_id in bought_items:
            orders.append({'user_id': u_id, 'product_id': p_id, 'final_preference': 5.0})
    pd.DataFrame(orders).to_csv(LOGS_PATH / "purchase_history.csv", index=False, encoding='utf-8-sig')

    print(f"✨ [성공] {LOGS_PATH} 위치에 모든 마스터 데이터 생성 완료")

if __name__ == "__main__":
    generate_kosmo_data()
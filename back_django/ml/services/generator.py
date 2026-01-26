import os
import sys
import django
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
django.setup()

from django.conf import settings

# [개인화 설정] 랜덤 시드 1 고정 및 모든 명칭 kosmo 통일
np.random.seed(1)
random.seed(1)
PROJECT_NAME = "kosmo"

def generate_kosmo_universal_data(num_products=100, num_users=50):
    LOGS_PATH = Path(settings.BASE_DIR).parent / "logs"
    os.makedirs(LOGS_PATH, exist_ok=True)
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 1. 범용 카테고리 정의 (사료 외 용품 5종 세트 완벽 복구)
    species_list = ['강아지', '고양이', '관상어', '소동물']
    item_types = [
        {'name': '기능성 사료', 'price_range': (20, 90)},
        {'name': '맛있는 간식', 'price_range': (5, 40)},
        {'name': '생활/리빙용품', 'price_range': (15, 150)},
        {'name': '위생/청결용품', 'price_range': (10, 60)},
        {'name': '장난감/교구', 'price_range': (5, 35)}
    ]

    categories = []
    cat_id_counter = 1
    species_map = {}
    
    # 대분류 (종) 생성
    for species in species_list:
        categories.append({'category_id': cat_id_counter, 'parent_id': None, 'name': species, 'depth': 1, 'sort_order': cat_id_counter})
        species_map[species] = cat_id_counter
        cat_id_counter += 1

    # 소분류 (상품 종류) 생성
    product_cat_ids = []
    cat_info = {} 
    for species, p_id in species_map.items():
        for i, itype in enumerate(item_types):
            full_cat_name = f"{species} {itype['name']}"
            categories.append({
                'category_id': cat_id_counter, 'parent_id': p_id, 
                'name': full_cat_name, 'depth': 2, 'sort_order': i + 1
            })
            product_cat_ids.append(cat_id_counter)
            cat_info[cat_id_counter] = itype
            cat_id_counter += 1

    df_cat = pd.DataFrame(categories)
    df_cat.to_csv(LOGS_PATH / "category_master.csv", index=False, encoding='utf-8-sig')

    # 2. 상품 생성 (사료 + 장난감 + 용품 등이 섞이도록 로직 강화)
    brands = ['앙팡', 'Enfant', '테리블', '네이처팡', '퓨어펫']
    prefixes = ['프리미엄', '유기농', '데일리', '수제', '전문가용']
    
    products = []
    for i in range(1, num_products + 1):
        # 모든 카테고리(사료/장난감 등)에서 무작위로 하나 선택
        c_id = np.random.choice(product_cat_ids)
        target_cat = cat_info[c_id]
        cat_name = df_cat[df_cat['category_id'] == c_id]['name'].values[0]
        
        brand = np.random.choice(brands)
        prefix = np.random.choice(prefixes)
        p_name = f"[{brand}] {prefix} {cat_name}"
        
        min_p, max_p = target_cat['price_range']
        price = int(np.random.randint(min_p, max_p)) * 1000

        products.append({
            'product_id': i, 
            'category_id': c_id, 
            'product_code': f"KOSMO-P-{i:03d}", 
            'name': p_name, 
            'status': 'ON_SALE', 
            'base_price': price,
            'description': f"{brand}에서 제안하는 {prefix} 품질의 {cat_name}입니다.", 
            'average_rating': 0.0, 
            'review_count': 0,
            'created_at': current_time, 
            'updated_at': current_time
        })
    df_prod = pd.DataFrame(products)
    df_prod.to_csv(LOGS_PATH / "product_master.csv", index=False, encoding='utf-8-sig')

    # 3. 펫 정보 생성
    pets = []
    for u_id in range(1, num_users + 1):
        chosen_species = np.random.choice(species_list)
        pets.append({
            'pet_id': u_id, 'user_id': u_id, 'name': f"코스모펫{u_id}",
            'species': chosen_species, 'age': np.random.randint(0, 15),
            'activity_level': np.random.randint(1, 4), 'created_at': current_time
        })
    df_pet = pd.DataFrame(pets)
    df_pet.to_csv(LOGS_PATH / "pet_master.csv", index=False, encoding='utf-8-sig')

    # 4. 구매 이력 생성 (사료 외에 장난감/용품 구매 이력도 포함)
    orders = []
    for _, p in df_pet.iterrows():
        # 펫의 종에 맞는 모든 상품(사료, 장난감 등)을 구매 후보로 선정
        matching_cats = df_cat[df_cat['name'].str.contains(p['species'])]['category_id'].tolist()
        possible_prods = df_prod[df_prod['category_id'].isin(matching_cats)]['product_id'].tolist()
        
        if possible_prods:
            # 유저당 7개의 상품을 구매 (이 과정에서 사료와 장난감이 섞임)
            for _ in range(7):
                orders.append({
                    'user_id': p['user_id'],
                    'product_id': np.random.choice(possible_prods),
                    'created_at': current_time
                })
    pd.DataFrame(orders).to_csv(LOGS_PATH / "purchase_history.csv", index=False, encoding='utf-8-sig')

    print(f"✅ [{PROJECT_NAME}] 데이터 생성 완료 (랜덤시드: 1)")
    print(f"✅ 카테고리별 상품 100개(사료/장난감/용품 혼합) 생성 완료!")

if __name__ == "__main__":
    generate_kosmo_universal_data()
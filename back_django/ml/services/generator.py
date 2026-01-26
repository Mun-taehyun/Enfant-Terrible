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
# -------------------------

from django.conf import settings

# [개인화 설정] 랜덤 시드 1 고정
np.random.seed(1)
random.seed(1)

def generate_universal_pet_data(num_products=100):
    LOGS_PATH = Path(settings.BASE_DIR).parent / "logs"
    if not os.path.exists(LOGS_PATH): os.makedirs(LOGS_PATH)
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 1. 범용 카테고리 정의 (확장이 매우 쉬운 구조)
    species_list = ['강아지', '고양이', '관상어', '소동물(햄스터/토끼)'] # 대분류
    item_types = [
        {'name': '기능성 사료', 'price_range': (20, 90)},
        {'name': '맛있는 간식', 'price_range': (5, 40)},
        {'name': '생활/리빙용품', 'price_range': (15, 150)},
        {'name': '위생/청결용품', 'price_range': (10, 60)},
        {'name': '장난감/교구', 'price_range': (5, 35)}
    ] # 중분류 템플릿

    categories = []
    cat_id_counter = 1
    
    # 계층형 카테고리 생성 로직
    # Depth 1: 반려동물 종
    species_map = {}
    for species in species_list:
        categories.append({
            'category_id': cat_id_counter,
            'parent_id': None,
            'name': species,
            'depth': 1,
            'sort_order': cat_id_counter
        })
        species_map[species] = cat_id_counter
        cat_id_counter += 1

    # Depth 2: 각 종별 제품 카테고리
    product_cat_ids = []
    cat_info = {} # 상품 생성 시 참고할 가격 정보 저장
    for species, p_id in species_map.items():
        for i, itype in enumerate(item_types):
            categories.append({
                'category_id': cat_id_counter,
                'parent_id': p_id,
                'name': f"{species} {itype['name']}",
                'depth': 2,
                'sort_order': i + 1
            })
            product_cat_ids.append(cat_id_counter)
            cat_info[cat_id_counter] = itype
            cat_id_counter += 1

    df_cat = pd.DataFrame(categories)
    df_cat['is_active'] = 'Y'
    df_cat['created_at'] = current_time
    df_cat['updated_at'] = current_time
    df_cat['deleted_at'] = None
    df_cat.to_csv(LOGS_PATH / "category_master.csv", index=False, encoding='utf-8-sig')

    # 2. 상품 생성 (생성된 카테고리 기반)
    brands = ['앙팡', 'Enfant', '테리블', '네이처팡', '퓨어펫']
    prefixes = ['프리미엄', '유기농', '데일리', '수제', '전문가용']
    
    products = []
    for i in range(1, num_products + 1):
        # 생성된 소분류 카테고리 중 하나 선택
        c_id = np.random.choice(product_cat_ids)
        target_cat = cat_info[c_id]
        
        brand = np.random.choice(brands)
        prefix = np.random.choice(prefixes)
        
        # 상품명 예시: [앙팡] 프리미엄 강아지 기능성 사료
        p_name = f"[{brand}] {prefix} {df_cat[df_cat['category_id']==c_id]['name'].values[0]}"
        
        min_p, max_p = target_cat['price_range']
        price = int(np.random.randint(min_p, max_p)) * 1000
        
        products.append({
            'product_id': i,
            'category_id': c_id, 
            'product_code': f"ET-P-{i:03d}", 
            'name': p_name, 
            'status': 'ON_SALE',
            'base_price': price,
            'description': f"{brand}에서 제안하는 {prefix} 품질의 제품입니다.", 
            'average_rating': 0.0,
            'review_count': 0,
            'created_at': current_time,
            'updated_at': current_time,
            'deleted_at': None
        })

    df_prod = pd.DataFrame(products)
    df_prod.to_csv(LOGS_PATH / "product_master_erd.csv", index=False, encoding='utf-8-sig')
    
    print(f"✅ [User: enfant] {len(species_list)}개 종, {len(item_types)}개 분류 기반 총 {num_products}개 상품 생성 완료!")

if __name__ == "__main__":
    generate_universal_pet_data()
#product_generator.py
#상품CSV 생성  product_geneartor에서 적재할 것이다.

import pandas as pd
import numpy as np
import os
from datetime import datetime

# [설정] 랜덤 시드 1로 고정
np.random.seed(1)

def generate_grand_product_master_erd(num_products=100):
    current_file_path = os.path.abspath(__file__) 
    base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
    RAW_PATH = os.path.join(base_dir, "data", "raw")
    if not os.path.exists(RAW_PATH): os.makedirs(RAW_PATH)

    # 1. ERD 기반 카테고리 ID 매핑 및 카테고리별 특화 명칭
    cat_templates = {
        1: {'name': '사료/간식', 'items': ['연어 사료', '닭가슴살 육포', '덴탈 껌', '북어 트릿'], 'price_range': (15, 60)},
        2: {'name': '의류/리빙', 'items': ['순면 티셔츠', '방수 레인코트', '마약 방석', '쿨매트'], 'price_range': (20, 120)},
        3: {'name': '위생/건강', 'items': ['저자극 샴푸', '눈세정제', '관절 영양제', '배변 패드'], 'price_range': (10, 80)}
    }

    brands = ['앙팡', 'Enfant', '테리블', '네이처팡', '퓨어도그']
    qualities = ['프리미엄', '유기농', '그레인프리', '수제', '내추럴']
    
    products = []
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    for i in range(1, num_products + 1):
        c_id = np.random.choice([1, 2, 3])
        brand = np.random.choice(brands)
        quality = np.random.choice(qualities)
        item_name = np.random.choice(cat_templates[c_id]['items'])
        
        p_name = f"[{brand}] {quality} {item_name}"
        
        # 카테고리별 현실적인 가격 계산
        min_p, max_p = cat_templates[c_id]['price_range']
        price = int(np.random.randint(min_p, max_p)) * 500
        
        # --- ERD et_product 테이블 구조 완벽 대응 ---
        products.append({
            'product_id': i,
            'category_id': c_id, 
            'product_code': f"ET-P-{i:03d}", 
            'name': p_name, 
            'description': f"{brand} 브랜드의 {quality} 라인업 {item_name} 상품입니다. 반려동물의 건강을 생각했습니다.", 
            'base_price': price,
            'status': 'SALE',           # ERD 필수: 실제 판매 중 상태로 설정
            'created_at': current_time,  # ERD 필수: 데이터 생성 시간
            'updated_at': current_time   # ERD 필수: 최종 수정 시간
        })

    df = pd.DataFrame(products)
    output_file = os.path.join(RAW_PATH, "product_master_erd.csv")
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    
    print(f"✅ [Enfant Terrible] DB 구조 및 판매 로직이 포함된 {num_products}개 상품 생성 완료!")
    print(f"📍 저장 위치: {output_file}")

if __name__ == "__main__":
    generate_grand_product_master_erd()
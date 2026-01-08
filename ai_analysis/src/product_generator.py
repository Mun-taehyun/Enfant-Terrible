import pandas as pd
import numpy as np
import os

# 시드 고정
np.random.seed(1)

def generate_grand_product_master_erd(num_products=100):
    current_file_path = os.path.abspath(__file__) 
    base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
    RAW_PATH = os.path.join(base_dir, "data", "raw")
    if not os.path.exists(RAW_PATH): os.makedirs(RAW_PATH)

    # 1. ERD 기반 카테고리 ID 매핑 (실제 DB에 들어갈 ID값)
    cat_id_map = {
        1: '사료/간식',
        2: '의류/리빙',
        3: '위생/건강'
    }

    # 2. 브랜드 및 재료 (데이터 풍성함을 위함)
    brands = ['앙팡', 'Enfant', '테리블', '네이처팡', '퓨어도그']
    qualities = ['프리미엄', '유기농', '그레인프리', '수제', '내추럴']
    
    products = []
    
    for i in range(1, num_products + 1):
        # ERD 구조에 맞춰 데이터 생성
        c_id = np.random.choice([1, 2, 3])
        brand = np.random.choice(brands)
        quality = np.random.choice(qualities)
        
        # 상품명 생성
        p_name = f"[{brand}] {quality} 반려견 용품 {i}"
        
        # --- ERD 컬럼 구조에 100% 맞춤 ---
        products.append({
            'product_id': i,
            'category_id': c_id,                     # ERD 외래키
            'product_code': f"ET-P-{i:03d}",         # ERD 필수 컬럼
            'name': p_name,                          # ERD 컬럼명 (product_name 아님)
            'description': f"{brand} 브랜드의 {quality} 라인업 상품입니다.", # ERD 컬럼
            'base_price': int(np.random.randint(5, 100)) * 500 # ERD 컬럼명 (price 아님)
            
            # 주의: target_age, image_url 등은 ERD에 없으므로 
            # 나중에 ALTER TABLE로 컬럼을 추가하기 전까지는 DB 입력 시 제외해야 합니다.
        })

    df = pd.DataFrame(products)
    output_file = os.path.join(RAW_PATH, "product_master_erd.csv")
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    
    print(f"✅ ERD 구조와 100% 일치하는 {num_products}개 상품 생성 완료!")

if __name__ == "__main__":
    generate_grand_product_master_erd()
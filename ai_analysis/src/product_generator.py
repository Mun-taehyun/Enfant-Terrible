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

    # 1. ERD 기반 카테고리 ID 매핑 (enfant_terrible DB 구조 준수)
    cat_id_map = {
        1: '사료/간식',
        2: '의류/리빙',
        3: '위생/건강'
    }

    # 2. 브랜드 및 재료
    brands = ['앙팡', 'Enfant', '테리블', '네이처팡', '퓨어도그']
    qualities = ['프리미엄', '유기농', '그레인프리', '수제', '내추럴']
    
    products = []
    
    for i in range(1, num_products + 1):
        c_id = np.random.choice([1, 2, 3])
        brand = np.random.choice(brands)
        quality = np.random.choice(qualities)
        
        p_name = f"[{brand}] {quality} 반려견 용품 {i}"
        
        # --- ERD 컬럼 구조에 100% 맞춤 ---
        products.append({
            'product_id': i,
            'category_id': c_id, 
            'product_code': f"ET-P-{i:03d}", 
            'name': p_name, 
            'description': f"{brand} 브랜드의 {quality} 라인업 상품입니다.", 
            'base_price': int(np.random.randint(5, 100)) * 500 
        })

    df = pd.DataFrame(products)
    output_file = os.path.join(RAW_PATH, "product_master_erd.csv")
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    
    # [수정] 로그 메시지에 프로젝트 명칭 반영
    print(f"✅ [Enfant Terrible] DB 구조와 100% 일치하는 {num_products}개 상품 CSV 생성 완료!")

if __name__ == "__main__":
    generate_grand_product_master_erd()
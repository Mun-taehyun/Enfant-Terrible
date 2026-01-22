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

# [개인화 설정] 랜덤 시드는 1로 고정
np.random.seed(1)
random.seed(1)

def generate_grand_product_master_erd(num_products=100):
    LOGS_PATH = Path(settings.BASE_DIR).parent / "logs"
    if not os.path.exists(LOGS_PATH): 
        os.makedirs(LOGS_PATH)

    # 1. 스키마 기반 카테고리 매핑 (et_category 구조 대응)
    # 실제 DB의 et_category 테이블에 ID 1, 2, 3이 먼저 존재해야 합니다.
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
        # 고정된 시드에 따라 일관된 결과 생성
        c_id = np.random.choice([1, 2, 3])
        brand = np.random.choice(brands)
        quality = np.random.choice(qualities)
        item_name = np.random.choice(cat_templates[c_id]['items'])
        
        p_name = f"[{brand}] {quality} {item_name}"
        
        # 가격 결정
        min_p, max_p = cat_templates[c_id]['price_range']
        price = int(np.random.randint(min_p, max_p)) * 500
        
        # --- 최신 kosmo.et_product 덤프 스키마(2026-01-20) 완벽 대응 ---
        products.append({
            'product_id': i,
            'category_id': c_id, 
            'product_code': f"ET-P-{i:03d}", 
            'name': p_name, 
            'status': 'ON_SALE',        # 스키마 DEFAULT 'ON_SALE' 반영
            'base_price': price,
            'description': f"{brand} 브랜드의 {quality} 라인업 {item_name} 상품입니다.", 
            'average_rating': 0.0,      # 스키마 float DEFAULT '0' 반영
            'review_count': 0,          # 스키마 int DEFAULT '0' 반영
            'created_at': current_time,
            'updated_at': current_time,
            'deleted_at': None          # 스키마 datetime DEFAULT NULL 반영
        })

    # 데이터프레임 생성
    df = pd.DataFrame(products)
    
    # 덤프 파일의 컬럼 순서와 유사하게 정렬 (가독성 목적)
    cols = ['product_id', 'category_id', 'product_code', 'name', 'status', 
            'base_price', 'description', 'average_rating', 'review_count', 
            'created_at', 'updated_at', 'deleted_at']
    df = df[cols]

    output_file = LOGS_PATH / "product_master_erd.csv"
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    
    print(f"✅ [User: enfant] 최신 스키마 및 시드(1) 기반 {num_products}개 상품 생성 완료!")
    print(f"📍 저장 위치: {output_file}")

if __name__ == "__main__":
    generate_grand_product_master_erd()
import pandas as pd
import numpy as np
from pathlib import Path
import random

# 랜덤 시드 고정 (재현성 확보)
np.random.seed(1)
random.seed(1)

def export_all_to_csv():
    # 저장 경로 설정
    output_path = Path("./export_to_teacher")
    output_path.mkdir(exist_ok=True)
    
    # 1. 카테고리 데이터 (et_category)
    species_list = ['강아지', '고양이', '관상어', '소동물']
    item_types = ['기능성 사료', '맛있는 간식', '생활/리빙용품', '위생/청결용품', '장난감/교구']
    
    categories = []
    cat_id = 1
    for s in species_list:
        categories.append({'category_id': cat_id, 'parent_id': None, 'name': s, 'depth': 1})
        p_id = cat_id
        cat_id += 1
        for itype in item_types:
            categories.append({'category_id': cat_id, 'parent_id': p_id, 'name': f"{s} {itype}", 'depth': 2})
            cat_id += 1
    pd.DataFrame(categories).to_csv(output_path / "et_category.csv", index=False, encoding='utf-8-sig')

    # 2. 현실적인 상품 데이터 (et_product) - 이미지 주소 포함
    GITHUB_IMG_BASE = "https://raw.githubusercontent.com/Mun-taehyun/Enfant-Terrible/main/back_django/media/product-images/"
    real_keywords = {
        '강아지': ['그레인프리 연어 사료', '소고기 육포', '마약 메모리폼 침대', '저자극 샴푸', '노즈워크 담요'],
        '고양이': ['헤어볼 케어 사료', '참치 츄르', '원목 5단 캣타워', '벤토나이트 모래', '깃털 낚시대'],
        '관상어': ['베타 전용 비트', '열대어 영양제', '저소음 여과기', '수질 중화제', '수초 장식'],
        '소동물': ['티모시 건초', '알곡 혼합 사료', '무소음 쳇바퀴', '포근한 천 베딩', '은신처 장난감']
    }
    
    products = []
    brands = ['앙팡', 'Enfant', '테리블', '네이처팡', '퓨어펫']
    for i in range(1, 101):
        species = np.random.choice(species_list)
        keyword = np.random.choice(real_keywords[species])
        brand = np.random.choice(brands)
        cat_name = f"{species} {np.random.choice(item_types)}"
        c_id = next(item['category_id'] for item in categories if item['name'] == cat_name)
        
        # 이미지 URL 생성 및 description 결합
        img_url = f"{GITHUB_IMG_BASE}product-{i:03d}.png"
        desc = f"{brand}의 {species} 전용 {keyword} 제품입니다. ||IMG_URL||:{img_url}"
        
        products.append({
            'product_id': i,
            'category_id': c_id,
            'product_code': f"KOSMO-P-{i:03d}",
            'name': f"[{brand}] {species} {keyword}",
            'status': 'ON_SALE',
            'base_price': int(np.random.randint(5, 100)) * 1000,
            'description': desc
        })
    pd.DataFrame(products).to_csv(output_path / "et_product.csv", index=False, encoding='utf-8-sig')

    # 3. 상품 SKU (et_product_sku)
    skus = []
    for p in products:
        skus.append({
            'sku_id': p['product_id'],
            'product_id': p['product_id'],
            'sku_code': f"SKU-{p['product_id']:03d}",
            'price': p['base_price'],
            'stock': 999,
            'status': 'ON_SALE'
        })
    pd.DataFrame(skus).to_csv(output_path / "et_product_sku.csv", index=False, encoding='utf-8-sig')

    # 4. 사용자 데이터 (et_user) - 상세 필드 및 박종원님 데이터 반영
    users = []
    # (1) 관리자 데이터 (user_id 3번 유지)
    users.append({
        'user_id': 3,
        'email': 'kasd178515@gmail.com',
        'password': '$2a$10$WUAkbUT6uZl6v/p9lu.1vO0dQ8XWUV...',
        'name': '박종원',
        'tel': '010-2222-1111',
        'zip_code': '06035',
        'address_base': '서울 강남구 가로수길 5',
        'address_detail': 'ㅇㅇ',
        'email_verified': 'Y',
        'provider': 'local',
        'role': 'ADMIN',
        'status': 'ACTIVE'
    })
    # (2) 나머지 테스트 유저
    for i in range(1, 51):
        if i == 3: continue
        users.append({
            'user_id': i,
            'email': f'user{i}@test.com',
            'password': 'hashed_password_here',
            'name': f'테스트유저{i}',
            'tel': '010-0000-0000',
            'zip_code': '12345',
            'address_base': '서울특별시 중구 세종대로 110',
            'address_detail': '테스트동',
            'email_verified': 'Y',
            'provider': 'local',
            'role': 'USER',
            'status': 'ACTIVE'
        })
    pd.DataFrame(users).to_csv(output_path / "et_user.csv", index=False, encoding='utf-8-sig')

    # 5. 추천 데이터 (et_user_recommendation)
    recommendations = []
    reco_id = 1
    for u_id in [u['user_id'] for u in users]:
        for rank in range(1, 11):
            recommendations.append({
                'recommendation_id': reco_id,
                'user_id': u_id,
                'product_id': np.random.randint(1, 101),
                'rank_no': rank,
                'score': round(float(100 - (rank * 2) + np.random.random()), 2)
            })
            reco_id += 1
    pd.DataFrame(recommendations).to_csv(output_path / "et_user_recommendation.csv", index=False, encoding='utf-8-sig')

    print(f"✅ 수정된 5개의 CSV 파일이 '{output_path.absolute()}'에 생성되었습니다!")

if __name__ == "__main__":
    export_all_to_csv()
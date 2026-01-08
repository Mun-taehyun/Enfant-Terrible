import pandas as pd
import numpy as np
import os

# 실행할 때마다 결과가 똑같도록 시드 고정
np.random.seed(1)

# 함수의 기본값을 10000에서 100으로 수정했습니다.
def generate_grand_product_master(num_products=100):
    # --- 경로 자동 설정 ---
    current_file_path = os.path.abspath(__file__) 
    base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
    RAW_PATH = os.path.join(base_dir, "data", "raw")
    
    if not os.path.exists(RAW_PATH):
        os.makedirs(RAW_PATH)
    # ----------------------

    # 1. 브랜드 및 수식어
    brands = ['앙팡', 'Enfant', '테리블', '네이처팡', '퓨어도그', '닥터테리블']
    qualities = ['프리미엄', '유기농', '그레인프리', '가수분해', '저알러지', '고단백', '수제', '데일리', '내추럴']
    
    # 2. 메인 재료
    ingredients = ['연어', '소고기', '닭가슴살', '오리', '칠면조', '양고기', '말고기', '황태', '고구마', '단호박', '곤충단백질', '사슴고기']
    
    # 3. 카테고리별 상세 상품군
    category_map = {
        '식품/사료': ['레시피 사료', '소프트 키블', '건식 식단', '화식 식단', '동결건조 생식', '저지방 다이어트식'],
        '식품/간식': ['동결건조 트릿', '슬라이스 육포', '덴탈 치즈껌', '미트볼 스틱', '고구마 말랭이', '수제 비스킷', '락토프리 우유'],
        '건강/영양': ['관절 강화 영양제', '피부 피모 유산균', '눈가 깨끗 루테인', '종합 비타민 파우더', '심장 튼튼 코엔자임'],
        '장난감/교육': ['노즈워크 담요', '천연고무 치발기', '실내용 자동 공놀이', '바스락 삑 삑이 인형', '지능개발 퍼즐트레이', '강력 터그 로프'],
        '산책/외출': ['리플렉티브 하네스', '이지워크 가슴줄', '자동 리드줄 5m', '배변 봉투 파우치', '휴대용 물통', '기능성 쿨링 조끼'],
        '위생/미용': ['무자극 약용 샴푸', '실키 컨디셔너', '초강력 흡수 배변패드', '눈세정 티슈', '귀세정제', '발바닥 보습 밤'],
        '리빙/가구': ['메모리폼 마약 방석', '슬개골 보호 미끄럼방지 매트', '원목 높이조절 식기', '사계절 쿨매트', '프라이빗 켄넬'],
        '의류/액세서리': ['순면 데일리 티셔츠', '방수 올인원 레인코트', '보따리 스카프', '겨울용 패딩 조끼', '귀도리 모자']
    }

    products = []
    options = ['S', 'M', 'L', '1kg', '2kg', '300g', '500ml', '박스형']
    
    for i in range(1, num_products + 1):
        cat = np.random.choice(list(category_map.keys()))
        brand = np.random.choice(brands)
        quality = np.random.choice(qualities)
        item_type = np.random.choice(category_map[cat])
        
        if '식품' in cat or '건강' in cat:
            ing = np.random.choice(ingredients)
            name = f"[{brand}] {quality} {ing} {item_type}"
        else:
            name = f"[{brand}] {quality} {item_type}"
            
        option = np.random.choice(options)
        final_name = f"{name} ({option})"
        
        target_age = np.random.choice([0, 1, 2])
        target_size = np.random.choice([0, 1, 2])

        products.append({
            'product_id': i,
            'product_name': final_name,
            'category': cat,
            'price': int(np.random.randint(5, 200)) * 500,
            'target_age': target_age,
            'target_size': target_size
        })

    df = pd.DataFrame(products)
    
    # 최종 저장
    output_file = os.path.join(RAW_PATH, "product_master.csv")
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    
    print(f"✅ 위치: {output_file}")
    print(f"✅ 총 {num_products}개의 고정된 상품 리스트가 생성되었습니다! (Seed=1)")

if __name__ == "__main__":
    generate_grand_product_master() # 여기서 100개가 기본으로 들어갑니다.
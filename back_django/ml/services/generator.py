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

# [개인화 설정] 랜덤 시드 1 고정
np.random.seed(1)
random.seed(1)
PROJECT_NAME = "kosmo"

def generate_kosmo_universal_data(num_products=100, num_users=50):
    LOGS_PATH = Path(settings.BASE_DIR).parent / "logs"
    os.makedirs(LOGS_PATH, exist_ok=True)
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 1. 현실적인 세부 아이템 키워드 정의 (핵심 수정 사항)
    # 각 종과 카테고리에 맞는 실제 상품명 키워드를 리스트화합니다.
    real_item_keywords = {
        '강아지': {
            '기능성 사료': ['그레인프리 연어 사료', '고단백 다이어트 사료', '시니어 관절케어 사료', '소형견용 한입 사료'],
            '맛있는 간식': ['국내산 소고기 육포', '치즈 듬뿍 우유껌', '오리 안심 슬라이스', '동결건조 북어 트릿'],
            '생활/리빙용품': ['마약 메모리폼 침대', '높이조절 세라믹 식기', '사계절 쿨매트', '외출용 접이식 유모차'],
            '위생/청결용품': ['대형 배변패드 50매', '저자극 약용 샴푸', '먼지 없는 눈가 세정 티슈', '무소음 발톱 깎기'],
            '장난감/교구': ['지능발달 노즈워크 담요', '치실 밧줄 터그놀이', '삑삑이 라텍스 인형', '간식 탈출 오뚜기 볼']
        },
        '고양이': {
            '기능성 사료': ['인도어 헤어볼 케어 사료', '비뇨기 건강 처방식', '무곡물 치킨&연어 사료', '키튼 전용 고영양 사료'],
            '맛있는 간식': ['참치 가득 츄르 20개입', '가다랑어포 슬라이스', '바삭한 캣닙 스낵', '연어 스테이크 트릿'],
            '생활/리빙용품': ['원목 5단 스카이 캣타워', '먼지 없는 벤토나이트 모래', '숨바꼭질 터널 소파', '세라믹 자동 급수기'],
            '위생/청결용품': ['대형 후드형 화장실', '무향 살균 탈취 스프레이', '실리콘 그루밍 브러쉬', '눈가 귀 세정제 세트'],
            '장난감/교구': ['깃털 낚시대 3종 세트', '자동 회전 레이저 포인터', '캣닙 물고기 인형', '양면 스크래쳐 라운지']
        },
        '관상어': {
            '기능성 사료': ['베타 전용 고단백 비트', '열대어 증색 영양 사료', '금붕어용 플레이크 사료'],
            '맛있는 간식': ['건조 장내 미생물 간식', '냉동 건조 실지렁이'],
            '생활/리빙용품': ['저소음 외부 여과기', '수조용 고휘도 LED 조명', '자연석 수조 장식'],
            '위생/청결용품': ['박테리아 활성 수질 중화제', '이끼 제거용 스크래퍼'],
            '장난감/교구': ['실리콘 인조 수초 세트', '수조용 난파선 은신처']
        },
        '소동물': {
            '기능성 사료': ['토끼용 티모시 건초 사료', '햄스터 전용 알곡 혼합 사료'],
            '맛있는 간식': ['말린 민들레 잎 간식', '소동물용 요거트 드롭스'],
            '생활/리빙용품': ['무소음 쳇바퀴', '겨울용 포근한 천 베딩'],
            '위생/청결용품': ['먼지 없는 먼지 제거 모래', '소동물 전용 탈취제'],
            '장난감/교구': ['갉아먹는 수수 줄기 공', '터널형 은신처 장난감']
        }
    }

    species_list = list(real_item_keywords.keys())
    item_types = ['기능성 사료', '맛있는 간식', '생활/리빙용품', '위생/청결용품', '장난감/교구']

    # 2. 카테고리 마스터 생성
    categories = []
    cat_id_counter = 1
    species_map = {}
    for species in species_list:
        categories.append({'category_id': cat_id_counter, 'parent_id': None, 'name': species, 'depth': 1, 'sort_order': cat_id_counter})
        species_map[species] = cat_id_counter
        cat_id_counter += 1

    cat_info = {} 
    for species, p_id in species_map.items():
        for i, itype_name in enumerate(item_types):
            full_cat_name = f"{species} {itype_name}"
            categories.append({
                'category_id': cat_id_counter, 'parent_id': p_id, 
                'name': full_cat_name, 'depth': 2, 'sort_order': i + 1
            })
            cat_info[cat_id_counter] = {'species': species, 'type': itype_name}
            cat_id_counter += 1

    df_cat = pd.DataFrame(categories)
    df_cat.to_csv(LOGS_PATH / "category_master.csv", index=False, encoding='utf-8-sig')

    # 3. 상품 생성 (리얼 키워드 기반 조합)
    brands = ['앙팡', 'Enfant', '테리블', '네이처팡', '퓨어펫']
    prefixes = ['프리미엄', '유기농', '데일리', '수제', '전문가용']
    
    products = []
    product_cat_ids = list(cat_info.keys())

    for i in range(1, num_products + 1):
        c_id = np.random.choice(product_cat_ids)
        info = cat_info[c_id]
        
        # 실제 키워드 리스트에서 무작위 선택
        keywords = real_item_keywords[info['species']][info['type']]
        detail_item = np.random.choice(keywords)
        
        brand = np.random.choice(brands)
        prefix = np.random.choice(prefixes)
        
        # [앙팡] 수제 고양이 깃털 낚시대 3종 세트 형태의 리얼한 상품명
        p_name = f"[{brand}] {prefix} {info['species']} {detail_item}"
        
        # 가격대 설정 (카테고리별 차등)
        price_map = {'기능성 사료': (20, 90), '맛있는 간식': (5, 40), '생활/리빙용품': (30, 200), '위생/청결용품': (10, 60), '장난감/교구': (5, 45)}
        min_p, max_p = price_map[info['type']]
        price = int(np.random.randint(min_p, max_p)) * 1000

        products.append({
            'product_id': i, 'category_id': c_id, 'product_code': f"KOSMO-P-{i:03d}", 'name': p_name, 
            'status': 'ON_SALE', 'base_price': price,
            'description': f"{brand}에서 자신 있게 선보이는 {prefix} 품질의 {info['species']} 전용 {detail_item}입니다.", 
            'average_rating': 0.0, 'review_count': 0, 'created_at': current_time, 'updated_at': current_time
        })
    df_prod = pd.DataFrame(products)
    df_prod.to_csv(LOGS_PATH / "product_master.csv", index=False, encoding='utf-8-sig')

    # 4. 펫 정보 및 구매 이력 생성 (기존 로직 유지)
    # ... (중략: 기존 코드와 동일한 펫 및 구매 이력 생성 로직) ...
    # (생략된 부분은 위에서 제공해주신 원본 코드의 펫/구매이력 파트를 그대로 사용하시면 됩니다.)

    print(f"✅ [{PROJECT_NAME}] 현실적인 상품 데이터 100개 생성 완료!")

if __name__ == "__main__":
    generate_kosmo_universal_data()
# generator.py
# 여러가지 csv todtjd. 필요 없을 가능성 1위
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

# [설정] 랜덤 시드 1로 고정 (일관된 데이터 생성)
np.random.seed(1)

# 경로 설정
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
RAW_PATH = os.path.join(base_dir, "data", "raw")
if not os.path.exists(RAW_PATH): os.makedirs(RAW_PATH)

def create_erd_perfect_data_v4():
    num_users = 100
    num_products = 50
    
    print(f"🚀 [Enfant Terrible] 상세 속성 반영 데이터 생성 시작... (User: enfant)")

    # 1. et_user (기본 유저 데이터)
    user_list = []
    for i in range(1, num_users + 1):
        user_list.append({
            'user_id': i,
            'email': f'user{i}@example.com',
            'password': 'hashed_password_123',
            'name': f'사용자{i}',
            'role': 'USER',
            'created_at': datetime(2025, 1, 1) + timedelta(days=i)
        })
    df_users = pd.DataFrame(user_list)

    # 2. et_user_attribute_value (반려견 프로필 - 요청하신 매핑 기준 적용)
    # attribute_id 1: 나이 (0:신생아, 1:성견, 2:노견)
    # attribute_id 2: 견종 (0:소형견, 1:중형견, 2:대형견)
    # attribute_id 3: 성별 및 중성화 (0:남아, 1:남아-중성, 2:여아, 3:여아-중성)
    # attribute_id 4: 활동성 레벨 (1:실내, 2:중간, 3:야외)
    dog_attr_list = []
    for u_id in range(1, num_users + 1):
        # 나이 (0~2)
        dog_attr_list.append({'user_id': u_id, 'attribute_id': 1, 'value_number': np.random.choice([0, 1, 2])})
        # 견종 (0~2)
        dog_attr_list.append({'user_id': u_id, 'attribute_id': 2, 'value_number': np.random.choice([0, 1, 2])})
        # 성별 및 중성화 (0~3)
        dog_attr_list.append({'user_id': u_id, 'attribute_id': 3, 'value_number': np.random.choice([0, 1, 2, 3])})
        # 활동성 (1~3)
        dog_attr_list.append({'user_id': u_id, 'attribute_id': 4, 'value_number': np.random.choice([1, 2, 3])})
    df_dog_profiles = pd.DataFrame(dog_attr_list)

    # 3. et_product (카테고리별 상품 데이터)
    categories = {1: "사료/간식", 2: "의류/액세서리", 3: "장난감/훈련용품"}
    product_templates = {
        1: ["고단백 연어 사료", "수제 오리 안심 육포", "가수분해 면역 츄", "동결건조 북어 트릿"],
        2: ["데일리 스트라이프 티", "프리미엄 노란 우비", "고급 가죽 하네스", "경량 패딩 조끼"],
        3: ["터그놀이 로프", "바스락 지능 발달 인형", "노즈워크 담요", "소리나는 테니스볼"]
    }
    
    product_list = []
    for p_id in range(1, num_products + 1):
        cat_id = np.random.choice([1, 2, 3])
        product_list.append({
            'product_id': p_id,
            'category_id': cat_id,
            'name': np.random.choice(product_templates[cat_id]) + f"_{p_id}",
            'base_price': np.random.randint(8, 80) * 1000, # 8,000원 ~ 80,000원
            'status': 'SALE',
            'created_at': datetime(2025, 1, 1),
            'updated_at': datetime(2025, 1, 1)
        })
    df_products = pd.DataFrame(product_list)

    # 4. et_order & et_order_item (주문 내역)
    orders = []
    order_items = []
    for o_id in range(1, 501):
        u_id = np.random.randint(1, num_users + 1)
        p_id = np.random.randint(1, num_products + 1)
        price = df_products.loc[df_products['product_id'] == p_id, 'base_price'].values[0]
        
        # et_order 생성
        order_date = datetime(2025, 1, 1) + timedelta(days=np.random.randint(0, 360), hours=np.random.randint(0, 24))
        orders.append({
            'order_id': o_id,
            'user_id': u_id,
            'total_amount': price,
            'order_date': order_date.strftime('%Y-%m-%d %H:%M:%S'),
            'delivery_status': 'DELIVERED'
        })
        # et_order_item 생성 (주문과 상품 연결)
        order_items.append({
            'order_item_id': o_id,
            'order_id': o_id,
            'product_id': p_id,
            'quantity': 1,
            'price': price
        })
    df_orders = pd.DataFrame(orders)
    df_order_items = pd.DataFrame(order_items)

    # 5. et_product_review (현실적인 리뷰 데이터)
    review_list = []
    # 주문 데이터 중 40% 정도가 리뷰를 남긴다고 가정
    sampled_orders = df_order_items.sample(n=200)
    review_contents = [
        "강아지가 너무 잘 먹어요!", "사이즈도 딱 맞고 재질이 좋네요.", 
        "배송이 빠릅니다.", "내구성이 살짝 아쉽지만 만족해요.",
        "우리 아이 최애 장난감이 됐어요!"
    ]
    
    for idx, row in sampled_orders.iterrows():
        order_info = df_orders.loc[df_orders['order_id'] == row['order_id']].iloc[0]
        review_date = datetime.strptime(order_info['order_date'], '%Y-%m-%d %H:%M:%S') + timedelta(days=np.random.randint(3, 10))
        
        review_list.append({
            'review_id': len(review_list) + 1,
            'user_id': order_info['user_id'],
            'product_id': row['product_id'],
            'order_id': row['order_id'],
            'content': np.random.choice(review_contents),
            'rating': np.random.choice([1, 2, 3, 4, 5], p=[0.05, 0.05, 0.1, 0.3, 0.5]),
            'created_at': review_date.strftime('%Y-%m-%d %H:%M:%S')
        })
    df_reviews = pd.DataFrame(review_list)

    # CSV 파일로 저장
    df_users.to_csv(os.path.join(RAW_PATH, "et_user.csv"), index=False)
    df_dog_profiles.to_csv(os.path.join(RAW_PATH, "et_user_attribute_value.csv"), index=False)
    df_products.to_csv(os.path.join(RAW_PATH, "et_product.csv"), index=False)
    df_orders.to_csv(os.path.join(RAW_PATH, "et_order.csv"), index=False)
    df_order_items.to_csv(os.path.join(RAW_PATH, "et_order_item.csv"), index=False)
    df_reviews.to_csv(os.path.join(RAW_PATH, "et_product_review.csv"), index=False)

    print(f"✅ 모든 상세 정보가 반영된 CSV 생성 완료! (Seed: 1)")

if __name__ == "__main__":
    create_erd_perfect_data_v4()
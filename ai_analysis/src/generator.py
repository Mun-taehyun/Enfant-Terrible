import pandas as pd
import numpy as np
import os

# 시드 고정
np.random.seed(1)

# 경로 설정
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
RAW_PATH = os.path.join(base_dir, "data", "raw")
if not os.path.exists(RAW_PATH): os.makedirs(RAW_PATH)

def create_erd_compatible_data():
    num_users = 100
    num_products = 100
    users = np.arange(1, num_users + 1)
    products = np.arange(1, num_products + 1)

    print(f"🚀 [Enfant Terrible] ERD 구조 완벽 대응 데이터 생성 시작")

    # 1. et_user_attribute_value 형식으로 생성 (핵심 변경 사항)
    # ERD 구조에 맞춰 attribute_id(1:나이, 2:사이즈, 3:성별, 4:활동성)로 생성
    dog_attr_list = []
    for u_id in users:
        dog_attr_list.append({'user_id': u_id, 'attribute_id': 1, 'value_number': np.random.choice([0, 1, 2])}) # 나이
        dog_attr_list.append({'user_id': u_id, 'attribute_id': 2, 'value_number': np.random.choice([0, 1, 2])}) # 사이즈
        dog_attr_list.append({'user_id': u_id, 'attribute_id': 3, 'value_number': np.random.choice([0, 1, 2, 3])}) # 성별
        dog_attr_list.append({'user_id': u_id, 'attribute_id': 4, 'value_number': np.random.choice([1, 2, 3])}) # 활동성
    
    df_dog_profiles = pd.DataFrame(dog_attr_list)
    df_dog_profiles.to_csv(os.path.join(RAW_PATH, "dog_profiles_erd.csv"), index=False)

    # 2. et_product 대응 (category_id 추가)
    df_products = pd.DataFrame({
        'product_id': products,
        'category_id': np.random.choice([1, 2, 3], num_products), # ERD 필수 외래키
        'name': [f"프리미엄 상품 {i}" for i in products],
        'base_price': np.random.randint(10, 100, num_products) * 500
    })
    df_products.to_csv(os.path.join(RAW_PATH, "products_erd.csv"), index=False)

    # 3. et_order, et_cart_item, et_product_review (기존 로직 유지하되 컬럼명 매칭)
    # [주문]
    df_orders = pd.DataFrame({
        'user_id': np.random.choice(users, 1500),
        'product_id': np.random.choice(products, 1500),
        'quantity': np.random.randint(1, 4, 1500)
    }).drop_duplicates(['user_id', 'product_id'])
    df_orders.to_csv(os.path.join(RAW_PATH, "orders.csv"), index=False)

    # [리뷰] - ERD의 rating 컬럼 반영
    df_reviews = pd.DataFrame({
        'user_id': np.random.choice(users, 800),
        'product_id': np.random.choice(products, 800),
        'rating': np.random.randint(1, 6, 800)
    }).drop_duplicates(['user_id', 'product_id'])
    df_reviews.to_csv(os.path.join(RAW_PATH, "reviews.csv"), index=False)

    print(f"✅ ERD 호환 데이터 생성 완료! (User ID: enfant)")

if __name__ == "__main__":
    create_erd_compatible_data()
import pandas as pd
import numpy as np
import os
import time

# [핵심] 데이터를 고정하기 위해 시드를 1로 설정합니다.
np.random.seed(1)

# --- 경로 자동 설정 ---
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
RAW_PATH = os.path.join(base_dir, "data", "raw")

if not os.path.exists(RAW_PATH):
    os.makedirs(RAW_PATH)
# ----------------------

def create_dog_project_data():
    # --- 상품 100개 기준 최적화 규모 설정 ---
    num_users = 5000         # 유저 5,000명
    num_products = 100       # 상품 100개
    # 유저당 평균 20개 정도 구매 (적당한 밀도)
    num_orders = 100000      
    # 유저당 평균 5~10개 정도 리뷰
    num_reviews = 30000      
    
    users = np.arange(1, num_users + 1)
    products = np.arange(1, num_products + 1)
    
    start_time = time.time()
    print(f"🐕 [Enfant Terrible] 최적화 고정 데이터 생성 시작 (Seed: 1)")

    # 1. 반려견 프로필 데이터 생성
    df_dog_profiles = pd.DataFrame({
        'user_id': users,
        'dog_age': np.random.choice([0, 1, 2], num_users),
        'dog_size': np.random.choice([0, 1, 2], num_users),
        'dog_gender_spec': np.random.choice([0, 1, 2, 3], num_users),
        'activity_level': np.random.choice([1, 2, 3], num_users)
    })
    df_dog_profiles.to_csv(os.path.join(RAW_PATH, "dog_profiles.csv"), index=False)
    print("✅ 1/3: dog_profiles.csv 생성 완료")

    # 2. 구매 내역 데이터 (orders.csv)
    print("⏳ 구매 데이터 생성 중...")
    df_orders = pd.DataFrame({
        'user_id': np.random.choice(users, num_orders),
        'product_id': np.random.choice(products, num_orders),
        'quantity': np.random.randint(1, 5, num_orders)
    })
    # 중복 구매건 합산
    df_orders = df_orders.groupby(['user_id', 'product_id'])['quantity'].sum().reset_index()
    df_orders.to_csv(os.path.join(RAW_PATH, "orders.csv"), index=False)
    print(f"✅ 2/3: orders.csv 생성 완료 ({len(df_orders):,})")

    # 3. 별점 리뷰 데이터 (reviews.csv)
    print("⏳ 리뷰 데이터 생성 중...")
    df_reviews = pd.DataFrame({
        'user_id': np.random.choice(users, num_reviews),
        'product_id': np.random.choice(products, num_reviews),
        'rating': np.random.randint(1, 6, num_reviews)
    })
    # 중복 리뷰 제거
    df_reviews = df_reviews.drop_duplicates(['user_id', 'product_id'])
    df_reviews.to_csv(os.path.join(RAW_PATH, "reviews.csv"), index=False)
    print(f"✅ 3/3: reviews.csv 생성 완료 ({len(df_reviews):,})")

    print(f"\n🏆 상품 100개 기준 최적화 데이터 생성 완료! 소요 시간: {time.time() - start_time:.2f}초")

if __name__ == "__main__":
    create_dog_project_data()
import pandas as pd
import numpy as np
import os
import time

# --- 경로 자동 설정 (새 프로젝트 구조 대응) ---
# 현재 파일(generator.py)의 절대 경로를 잡습니다.
current_file_path = os.path.abspath(__file__) 
# src의 상위 폴더인 ai_analysis 폴더를 기준(base_dir)으로 잡습니다.
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 

# 최종적으로 파일을 저장할 data/raw 폴더 경로를 생성합니다.
RAW_PATH = os.path.join(base_dir, "data", "raw")

# 폴더가 없으면 생성합니다.
if not os.path.exists(RAW_PATH):
    os.makedirs(RAW_PATH)
# ------------------------------------------

def create_dog_project_data():
    # --- 초대형 규모 설정 ---
    num_users = 500000       # 유저 50만 명
    num_products = 10000     # 상품 1만 개
    num_orders = 10000000    # 구매 내역 1,000만 건
    num_reviews = 3000000    # 별점 리뷰 300만 건
    
    users = np.arange(1, num_users + 1)
    products = np.arange(1, num_products + 1)
    
    start_time = time.time()
    print(f"🐕 [Enfant Terrible] 데이터 생성 시작 (위치: {RAW_PATH})")

    # 1. 반려견 프로필 데이터 생성
    df_dog_profiles = pd.DataFrame({
        'user_id': users,
        'dog_age': np.random.choice([0, 1, 2], num_users),
        'dog_size': np.random.choice([0, 1, 2], num_users),
        'dog_gender_spec': np.random.choice([0, 1, 2, 3], num_users),
        'activity_level': np.random.choice([1, 2, 3], num_users)
    })
    # os.path.join을 사용하여 파일명 결합
    df_dog_profiles.to_csv(os.path.join(RAW_PATH, "dog_profiles.csv"), index=False)
    print("✅ 1/3: dog_profiles.csv 생성 완료")

    # 2. 구매 내역 데이터 (orders.csv)
    print("⏳ 구매 데이터 생성 중...")
    df_orders = pd.DataFrame({
        'user_id': np.random.choice(users, num_orders),
        'product_id': np.random.choice(products, num_orders),
        'quantity': np.random.randint(1, 5, num_orders)
    })
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
    df_reviews = df_reviews.drop_duplicates(['user_id', 'product_id'])
    df_reviews.to_csv(os.path.join(RAW_PATH, "reviews.csv"), index=False)
    print(f"✅ 3/3: reviews.csv 생성 완료 ({len(df_reviews):,})")

    print(f"\n🏆 모든 데이터 생성 완료! 소요 시간: {time.time() - start_time:.2f}초")

if __name__ == "__main__":
    create_dog_project_data()
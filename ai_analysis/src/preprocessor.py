import pandas as pd
import numpy as np
import os
import time

# --- 경로 설정 ---
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
RAW_PATH = os.path.join(base_dir, "data", "raw")
PROCESSED_PATH = os.path.join(base_dir, "data", "processed")

if not os.path.exists(PROCESSED_PATH): os.makedirs(PROCESSED_PATH)

def preprocess_for_erd_structure():
    start_time = time.time()
    print("🧹 [Enfant Terrible] ERD 구조 대응 전처리 시작...")

    # 1. 데이터 로드 (ERD 구조에 맞는 파일명 사용)
    try:
        # 이전에 생성한 세로형(EAV) 프로필 데이터
        df_attr = pd.read_csv(os.path.join(RAW_PATH, "dog_profiles_erd.csv")) 
        df_orders = pd.read_csv(os.path.join(RAW_PATH, "orders.csv"))
        df_reviews = pd.read_csv(os.path.join(RAW_PATH, "reviews.csv"))
        df_carts = pd.read_csv(os.path.join(RAW_PATH, "carts.csv"))
    except FileNotFoundError as e:
        print(f"❌ 파일을 찾을 수 없습니다: {e}")
        return

    # 2. 프로필 데이터 전처리 (세로형 -> 가로형 변환)
    # attribute_id 1:나이, 2:사이즈, 3:성별, 4:활동성
    print("🔄 1/4: EAV 구조의 유저 프로필 변환 중...")
    df_profiles = df_attr.pivot(index='user_id', columns='attribute_id', values='value_number').reset_index()
    df_profiles.columns = ['user_id', 'dog_age', 'dog_size', 'dog_gender', 'dog_activity']

    # 3. 데이터 병합
    print("🔗 2/4: 활동 데이터 통합 중...")
    df_merged = pd.merge(df_orders, df_reviews, on=['user_id', 'product_id'], how='outer')
    df_merged = pd.merge(df_merged, df_carts, on=['user_id', 'product_id'], how='outer', indicator='in_cart')
    df_merged = pd.merge(df_merged, df_profiles, on='user_id', how='left')

    # 결측치 처리
    df_merged['rating'] = df_merged['rating'].fillna(0)
    df_merged['quantity'] = df_merged['quantity'].fillna(0)
    df_merged['in_cart'] = (df_merged['in_cart'] == 'both').astype(float) # 장바구니에 있으면 1, 없으면 0

    # 4. 통합 점수 계산 (ERD 기반 가중치)
    print("🔢 3/4: 행동 기반 가중치 계산 중...")
    
    # [가중치 정의]
    W_ORDER = 5.0
    W_REVIEW = 3.0
    W_CART = 2.0

    df_merged['total_score'] = (
        (df_merged['quantity'].clip(upper=1) * W_ORDER) +  # 구매 여부
        (df_merged['rating'] * (W_REVIEW / 5.0)) +         # 리뷰 점수 (5점 만점 환산)
        (df_merged['in_cart'] * W_CART)                    # 장바구니 가점
    )

    # 5. 결과 저장 (ERD의 et_user_recommendation 테이블 입력용)
    print(f"💾 4/4: 결과 저장 중...")
    final_df = df_merged[['user_id', 'product_id', 'total_score']]
    # 동일 유저-상품 중복 점수 합산
    final_df = final_df.groupby(['user_id', 'product_id'])['total_score'].sum().reset_index()
    
    output_file = os.path.join(PROCESSED_PATH, "integrated_score_v2.csv")
    final_df.to_csv(output_file, index=False)

    print(f"✨ 전처리 완료! (소요 시간: {time.time() - start_time:.2f}초)")

if __name__ == "__main__":
    preprocess_for_erd_structure()
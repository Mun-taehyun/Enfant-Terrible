import pandas as pd
import numpy as np
import os
import time

# --- 경로 자동 설정 ---
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 

RAW_PATH = os.path.join(base_dir, "data", "raw")
PROCESSED_PATH = os.path.join(base_dir, "data", "processed")

if not os.path.exists(PROCESSED_PATH):
    os.makedirs(PROCESSED_PATH)

def preprocess_dog_data():
    start_time = time.time()
    print("🧹 [Enfant Terrible] 데이터 최적화 전처리 시작...")

    # 1. 데이터 로드
    print("📖 1/4: 원본 데이터 읽는 중...")
    try:
        df_reviews = pd.read_csv(os.path.join(RAW_PATH, "reviews.csv"), dtype={'user_id': np.int32, 'product_id': np.int32, 'rating': np.int8})
        df_orders = pd.read_csv(os.path.join(RAW_PATH, "orders.csv"), dtype={'user_id': np.int32, 'product_id': np.int32, 'quantity': np.int16})
        df_profiles = pd.read_csv(os.path.join(RAW_PATH, "dog_profiles.csv"), dtype={
            'user_id': np.int32, 'dog_age': np.int8, 'dog_size': np.int8, 
            'dog_gender_spec': np.int8, 'activity_level': np.int8
        })
    except FileNotFoundError as e:
        print(f"❌ 파일을 찾을 수 없습니다: {e}")
        print("먼저 src/generator.py를 실행하여 데이터를 생성하세요.")
        return

    # 2. 데이터 병합 (이 부분이 빠지면 NameError가 발생합니다!)
    print("🔗 2/4: 데이터 병합 중 (Orders + Reviews + Profiles)...")
    # 주문(Orders)과 리뷰(Reviews)를 먼저 합치고
    df_merged = pd.merge(df_orders, df_reviews, on=['user_id', 'product_id'], how='outer')
    # 유저 프로필(Profiles) 정보를 추가로 합칩니다.
    df_merged = pd.merge(df_merged, df_profiles, on='user_id', how='left')

    # 메모리 확보를 위해 원본은 삭제
    del df_orders, df_reviews, df_profiles

    # 결측치 채우기
    df_merged['rating'] = df_merged['rating'].fillna(0).astype(np.int8)
    df_merged['quantity'] = df_merged['quantity'].fillna(0).astype(np.int16)

    # 3. 통합 점수 계산
    print("🔢 3/4: 반려견 특성 맞춤형 점수 계산 중...")
    df_merged['total_score'] = (
        (df_merged['rating'] * 1.2) + 
        (df_merged['quantity'] * 0.8) +
        ((df_merged['product_id'] % 3 == 0) & (df_merged['activity_level'] == 3)).astype(float) * 2.0 +
        ((df_merged['product_id'] % 10 == df_merged['dog_age'])).astype(float) * 1.5
    ).astype(np.float32)

    # 4. 최종 데이터 정제 및 저장
    print(f"💾 4/4: 결과 저장 중 (총 {len(df_merged):,} 행)...")
    final_df = df_merged[['user_id', 'product_id', 'total_score']]
    
    output_file = os.path.join(PROCESSED_PATH, "integrated_score_v2.csv")
    final_df.to_csv(output_file, index=False)

    file_size = os.path.getsize(output_file) / (1024 * 1024)
    print(f"✨ 전처리 완료! (소요 시간: {time.time() - start_time:.2f}초)")
    print(f"📍 파일 위치: {output_file} (파일 용량: {file_size:.2f} MB)")

if __name__ == "__main__":
    preprocess_dog_data()
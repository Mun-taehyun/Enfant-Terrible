import pandas as pd
import numpy as np
import os
import time

# --- 경로 설정 동일 ---
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
        # 데이터 규모가 작아졌으므로 데이터 타입은 기본형으로 읽어도 충분히 빠릅니다.
        df_reviews = pd.read_csv(os.path.join(RAW_PATH, "reviews.csv"))
        df_orders = pd.read_csv(os.path.join(RAW_PATH, "orders.csv"))
        df_profiles = pd.read_csv(os.path.join(RAW_PATH, "dog_profiles.csv"))
    except FileNotFoundError as e:
        print(f"❌ 파일을 찾을 수 없습니다: {e}")
        return

    # 2. 데이터 병합
    print("🔗 2/4: 데이터 병합 중...")
    df_merged = pd.merge(df_orders, df_reviews, on=['user_id', 'product_id'], how='outer')
    df_merged = pd.merge(df_merged, df_profiles, on='user_id', how='left')

    # 결측치 채우기
    df_merged['rating'] = df_merged['rating'].fillna(0)
    df_merged['quantity'] = df_merged['quantity'].fillna(0)

    # 3. 통합 점수 계산 (사용자님이 설정하신 로직 그대로 유지)
    print("🔢 3/4: 반려견 특성 맞춤형 점수 계산 중...")
    df_merged['total_score'] = (
        (df_merged['rating'] * 1.2) + 
        (df_merged['quantity'] * 0.8) +
        ((df_merged['product_id'] % 3 == 0) & (df_merged['activity_level'] == 3)).astype(float) * 2.0 +
        ((df_merged['product_id'] % 10 == df_merged['dog_age'])).astype(float) * 1.5
    )

    # 4. 최종 데이터 정제 및 저장
    print(f"💾 4/4: 결과 저장 중 (총 {len(df_merged):,} 행)...")
    final_df = df_merged[['user_id', 'product_id', 'total_score']]
    
    output_file = os.path.join(PROCESSED_PATH, "integrated_score_v2.csv")
    final_df.to_csv(output_file, index=False)

    # ✨ 추가: 데이터 요약 출력 (전처리 담당자의 센스!)
    print("-" * 30)
    print(f"✅ 평균 통합 점수: {final_df['total_score'].mean():.2f}")
    print(f"✅ 최고 점수: {final_df['total_score'].max():.2f}")
    print("-" * 30)

    print(f"✨ 전처리 완료! (소요 시간: {time.time() - start_time:.2f}초)")
    print(f"📍 파일 위치: {output_file}")

if __name__ == "__main__":
    preprocess_dog_data()
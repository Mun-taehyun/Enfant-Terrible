import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text
import os

# --- 경로 자동 설정 ---
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
RAW_PATH = os.path.join(base_dir, "data", "raw")
PROCESSED_PATH = os.path.join(base_dir, "data", "processed")

# MySQL DB 연결 설정
DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_db?charset=utf8mb4'
engine = create_engine(DB_URL)

def run_recommendation_pipeline(target_user_id, top_n=5):
    try:
        print(f"📂 데이터 로딩 중...")
        df_scores = pd.read_csv(os.path.join(PROCESSED_PATH, "integrated_score_v2.csv"))
        df_profiles = pd.read_csv(os.path.join(RAW_PATH, "dog_profiles.csv"))
        
        # 1. 타겟 유저 확인
        target_info = df_profiles[df_profiles['user_id'] == target_user_id]
        if target_info.empty:
            print(f"⚠️ 유저 {target_user_id}의 프로필이 없습니다.")
            return

        # [수정] 2. 데이터 규모가 작으므로(유저 5천명) 샘플링 없이 전체 데이터 사용
        # 상품이 100개뿐이므로 전체 유저를 비교하는 것이 훨씬 정확한 추천이 나옵니다.
        print("⚙️ 추천 알고리즘 계산 중 (전체 유저 대상)...")
        user_item_matrix = df_scores.pivot_table(index='user_id', columns='product_id', values='total_score').fillna(0)
        
        # 행렬에 타겟 유저가 없는 경우(구매/리뷰 이력이 전혀 없는 경우) 처리
        if target_user_id not in user_item_matrix.index:
            print(f"⚠️ 유저 {target_user_id}의 활동 기록이 없어 추천이 불가합니다.")
            return

        # 3. 코사인 유사도 계산
        user_sim = cosine_similarity(user_item_matrix)
        user_sim_df = pd.DataFrame(user_sim, index=user_item_matrix.index, columns=user_item_matrix.index)
        
        # 4. 유사 유저 추출 (상위 20명으로 확대하여 더 풍부한 데이터 확보)
        similar_users = user_sim_df[target_user_id].sort_values(ascending=False)[1:21]
        sim_user_data = user_item_matrix.loc[similar_users.index]
        weights = similar_users.values.reshape(-1, 1)
        
        # 가중 평균 점수 계산
        weighted_scores = (sim_user_data * weights).sum(axis=0) / (weights.sum() + 1e-9)
        
        # 이미 구매한 상품 제외
        purchased = df_scores[df_scores['user_id'] == target_user_id]['product_id'].unique()
        recommendations = weighted_scores.drop(purchased, errors='ignore').sort_values(ascending=False).head(top_n)

        # 5. DB 저장
        print(f"🚀 MySQL DB에 저장 중... (User: {target_user_id})")
        with engine.connect() as conn:
            # 기존 추천 삭제 (테이블명은 대소문자 확인 필요 - 보통 소문자 권장)
            conn.execute(text("DELETE FROM et_user_recommendation WHERE USER_ID = :u_id"), {"u_id": target_user_id})
            
            for rank, (p_id, score) in enumerate(recommendations.items(), 1):
                sql = text("""
                    INSERT INTO et_user_recommendation (USER_ID, PRODUCT_ID, RANK_NO, SCORE)
                    VALUES (:u_id, :p_id, :rank, :score)
                """)
                conn.execute(sql, {
                    "u_id": target_user_id,
                    "p_id": int(p_id),
                    "rank": rank,
                    "score": float(score)
                })
            conn.commit()
            
        print(f"✅ 유저 {target_user_id}의 추천 리스트 {top_n}개 저장 완료!")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    # 유저 1번부터 5000번 사이의 ID로 테스트해보세요.
    run_recommendation_pipeline(1)
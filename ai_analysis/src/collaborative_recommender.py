import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text
import os

# --- 경로 자동 설정 (추천 엔진 버전) ---
# 현재 파일(src/collaborative_recommender.py) 위치 기준
current_file_path = os.path.abspath(__file__) 
# src의 부모인 ai_analysis 폴더를 기준(base_dir)으로 잡습니다.
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 

# 데이터 경로 정의
RAW_PATH = os.path.join(base_dir, "data", "raw")
PROCESSED_PATH = os.path.join(base_dir, "data", "processed")
# ------------------------------------------

# Oracle DB 연결 설정
# '아이디', '비밀번호'를 실제 정보로 수정하세요!
DB_URL = 'oracle+cx_oracle://ENFANT:1234@localhost:1521/?service_name=xe'
engine = create_engine(DB_URL)

def run_recommendation_pipeline(target_user_id, top_n=5):
    try:
        print(f"📂 데이터 로딩 중... (위치: {PROCESSED_PATH})")
        # os.path.join을 사용하여 경로 에러 방지
        df_scores = pd.read_csv(os.path.join(PROCESSED_PATH, "integrated_score_v2.csv"))
        df_profiles = pd.read_csv(os.path.join(RAW_PATH, "dog_profiles.csv"))
        
        # 2. 타겟 유저 및 유사 그룹 추출 (메모리 최적화)
        target_info = df_profiles[df_profiles['user_id'] == target_user_id]
        if target_info.empty:
            print(f"⚠️ 유저 {target_user_id}의 프로필이 없습니다.")
            return

        t_age = target_info.iloc[0]['dog_age']
        t_size = target_info.iloc[0]['dog_size']
        peer_ids = df_profiles[(df_profiles['dog_age']==t_age) & (df_profiles['dog_size']==t_size)]['user_id'].unique()
        
        if len(peer_ids) > 2000:
            peer_ids = np.random.choice(peer_ids, 2000, replace=False)
        sample_ids = np.unique(np.append(peer_ids, target_user_id))
        
        df_sub = df_scores[df_scores['user_id'].isin(sample_ids)]
        
        # 3. 행렬 생성 및 유사도 계산
        print("⚙️ 추천 알고리즘 계산 중...")
        user_item_matrix = df_sub.pivot_table(index='user_id', columns='product_id', values='total_score').fillna(0)
        
        user_sim = cosine_similarity(user_item_matrix)
        user_sim_df = pd.DataFrame(user_sim, index=user_item_matrix.index, columns=user_item_matrix.index)
        
        # 4. 추천 리스트 생성
        similar_users = user_sim_df[target_user_id].sort_values(ascending=False)[1:11]
        sim_user_data = user_item_matrix.loc[similar_users.index]
        weights = similar_users.values.reshape(-1, 1)
        
        weighted_scores = (sim_user_data * weights).sum(axis=0) / (weights.sum() + 1e-9)
        
        # 구매 상품 제외
        purchased = df_scores[df_scores['user_id'] == target_user_id]['product_id'].unique()
        recommendations = weighted_scores.drop(purchased, errors='ignore').sort_values(ascending=False).head(top_n)

        # 5. DB 저장 (Oracle 문법)
        print("🚀 Oracle DB에 저장 중...")
        with engine.connect() as conn:
            # DELETE와 INSERT 수행
            conn.execute(text("DELETE FROM ET_USER_RECOMMENDATION WHERE USER_ID = :u_id"), {"u_id": target_user_id})
            
            for rank, (p_id, score) in enumerate(recommendations.items(), 1):
                sql = text("""
                    INSERT INTO ET_USER_RECOMMENDATION (RECOMMENDATION_ID, USER_ID, PRODUCT_ID, RANK_NO, SCORE)
                    VALUES (ET_RECO_SEQ.NEXTVAL, :u_id, :p_id, :rank, :score)
                """)
                conn.execute(sql, {
                    "u_id": target_user_id,
                    "p_id": int(p_id),
                    "rank": rank,
                    "score": float(score)
                })
            conn.commit()
            
        print(f"✅ 유저 {target_user_id}의 추천 리스트 저장 완료!")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    # 테스트용 ID 1234. 실제 DB에 있는 유저 ID로 바꿔서 테스트하세요.
    run_recommendation_pipeline(1234)
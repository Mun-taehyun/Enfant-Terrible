import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text
import os
import time

# --- 경로 및 DB 설정 ---
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
RAW_PATH = os.path.join(base_dir, "data", "raw")
PROCESSED_PATH = os.path.join(base_dir, "data", "processed")

# 본인의 계정 정보로 수정 (C##ENFANT 또는 ENFANT)
DB_URL = 'oracle+cx_oracle://ENFANT:1234@localhost:1521/?service_name=xe'
engine = create_engine(DB_URL)

def run_batch_recommendations(limit_users=100):
    start_time = time.time()
    print(f"🚀 [Enfant Terrible] {limit_users}명 대상 대량 추천 업데이트 시작...")

    try:
        # 1. 데이터 로드
        df_scores = pd.read_csv(os.path.join(PROCESSED_PATH, "integrated_score_v2.csv"))
        df_profiles = pd.read_csv(os.path.join(RAW_PATH, "dog_profiles.csv"))
        
        # 2. 업데이트할 유저 샘플링 (활동이 있는 유저 중 상위 N명)
        target_users = df_scores['user_id'].unique()[:limit_users]
        
        print(f"📊 총 {len(target_users)}명의 유저를 처리합니다.")

        with engine.connect() as conn:
            for idx, user_id in enumerate(target_users):
                # 기존 추천 삭제
                conn.execute(text("DELETE FROM ET_USER_RECOMMENDATION WHERE USER_ID = :u_id"), {"u_id": int(user_id)})
                
                # --- 추천 로직 (유사 그룹 기반) ---
                user_info = df_profiles[df_profiles['user_id'] == user_id]
                if user_info.empty: continue
                
                t_age, t_size = user_info.iloc[0]['dog_age'], user_info.iloc[0]['dog_size']
                peer_ids = df_profiles[(df_profiles['dog_age']==t_age) & (df_profiles['dog_size']==t_size)]['user_id'].unique()
                
                # 유사 그룹 샘플링 (계산 속도 향상)
                if len(peer_ids) > 1000:
                    peer_ids = np.random.choice(peer_ids, 1000, replace=False)
                sample_ids = np.unique(np.append(peer_ids, user_id))
                
                df_sub = df_scores[df_scores['user_id'].isin(sample_ids)]
                matrix = df_sub.pivot_table(index='user_id', columns='product_id', values='total_score').fillna(0)
                
                # 유사도 및 가중치 계산
                user_sim = cosine_similarity(matrix)
                user_sim_df = pd.DataFrame(user_sim, index=matrix.index, columns=matrix.index)
                
                similar_users = user_sim_df[user_id].sort_values(ascending=False)[1:11]
                sim_user_data = matrix.loc[similar_users.index]
                weights = similar_users.values.reshape(-1, 1)
                
                weighted_scores = (sim_user_data * weights).sum(axis=0) / (weights.sum() + 1e-9)
                purchased = df_scores[df_scores['user_id'] == user_id]['product_id'].unique()
                recommendations = weighted_scores.drop(purchased, errors='ignore').sort_values(ascending=False).head(5)

                # --- DB 저장 ---
                for rank, (p_id, score) in enumerate(recommendations.items(), 1):
                    conn.execute(text("""
                        INSERT INTO ET_USER_RECOMMENDATION (RECOMMENDATION_ID, USER_ID, PRODUCT_ID, RANK_NO, SCORE)
                        VALUES (ET_RECO_SEQ.NEXTVAL, :u_id, :p_id, :rank, :score)
                    """), {"u_id": int(user_id), "p_id": int(p_id), "rank": rank, "score": float(score)})
                
                if (idx + 1) % 10 == 0:
                    print(f"⏳ 진행 중... ({idx + 1}/{len(target_users)})")
            
            conn.commit() # 최종 커밋

        print(f"✅ 대량 업데이트 완료! (소요 시간: {time.time() - start_time:.2f}초)")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    run_batch_recommendations(limit_users=500) # 500명 테스트
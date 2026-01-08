import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text
import os
import time

# --- 경로 설정 ---
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
PROCESSED_PATH = os.path.join(base_dir, "data", "processed")

# MySQL DB 연결 설정 (ID: enfant)
DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_db?charset=utf8mb4'
engine = create_engine(DB_URL)

def run_batch_recommendations_erd(limit_users=100):
    start_time = time.time()
    print(f"🚀 [Enfant Terrible] ERD 기반 {limit_users}명 추천 배치 시작...")

    try:
        score_file = os.path.join(PROCESSED_PATH, "integrated_score_v2.csv")
        if not os.path.exists(score_file):
            print("❌ 전처리된 파일이 없습니다.")
            return
            
        df_scores = pd.read_csv(score_file)
        matrix = df_scores.pivot_table(index='user_id', columns='product_id', values='total_score').fillna(0)
        
        # 코사인 유사도 계산
        user_sim = cosine_similarity(matrix)
        user_sim_df = pd.DataFrame(user_sim, index=matrix.index, columns=matrix.index)

        recommendation_data = []
        target_users = matrix.index[:limit_users]

        for user_id in target_users:
            similar_users = user_sim_df[user_id].sort_values(ascending=False)[1:11]
            sim_user_data = matrix.loc[similar_users.index]
            weights = similar_users.values.reshape(-1, 1)
            
            weighted_scores = (sim_user_data * weights).sum(axis=0) / (weights.sum() + 1e-9)
            
            # 이미 구매한 상품 제외
            purchased = df_scores[df_scores['user_id'] == user_id]['product_id'].unique()
            recs = weighted_scores.drop(purchased, errors='ignore').sort_values(ascending=False).head(5)

            for r_idx, (p_id, score) in enumerate(recs.items(), 1):
                recommendation_data.append({
                    "u_id": int(user_id),
                    "p_id": int(p_id),
                    "rank_val": r_idx, # ERD 컬럼 'rank'에 들어갈 값
                    "score_val": round(float(score), 4)
                })

        # 5. DB 저장 (ERD 구조에 완벽 대응)
        print(f"🚀 {len(recommendation_data)}건의 데이터를 et_user_recommendation에 반영 중...")
        with engine.connect() as conn:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            conn.execute(text("TRUNCATE TABLE et_user_recommendation;"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            
            # [수정 핵심] RANK_NO 대신 `rank` 사용 및 백틱 적용
            insert_query = text("""
                INSERT INTO et_user_recommendation (user_id, product_id, `rank`, score)
                VALUES (:u_id, :p_id, :rank_val, :score_val)
            """)
            
            conn.execute(insert_query, recommendation_data)
            conn.commit()

        print(f"✅ ERD 최적화 추천 완료! (소요 시간: {time.time() - start_time:.2f}초)")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    run_batch_recommendations_erd(limit_users=100)
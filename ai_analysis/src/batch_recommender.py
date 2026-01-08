import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text
import os
import time

# --- 설정 동일 ---
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
RAW_PATH = os.path.join(base_dir, "data", "raw")
PROCESSED_PATH = os.path.join(base_dir, "data", "processed")

DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_db?charset=utf8mb4'
engine = create_engine(DB_URL)

def run_batch_recommendations(limit_users=5000):
    start_time = time.time()
    print(f"🚀 [Enfant Terrible] {limit_users}명 대상 대량 추천 시작...")

    try:
        # 1. 데이터 로드
        df_scores = pd.read_csv(os.path.join(PROCESSED_PATH, "integrated_score_v2.csv"))
        
        # 2. 전체 유저-상품 행렬 생성 (한 번만 수행)
        print("⚙️ 전체 유저 행렬 생성 및 유사도 계산 중...")
        matrix = df_scores.pivot_table(index='user_id', columns='product_id', values='total_score').fillna(0)
        
        # 전체 유저 간 코사인 유사도 계산 (5000x5000 행렬은 금방 계산됩니다)
        user_sim = cosine_similarity(matrix)
        user_sim_df = pd.DataFrame(user_sim, index=matrix.index, columns=matrix.index)

        # 3. 추천 결과 수집 (메모리에서 처리 후 한꺼번에 DB 저장)
        target_users = matrix.index[:limit_users]
        recommendation_data = []

        print(f"🧠 {len(target_users)}명 유저의 추천 아이템 계산 중...")
        for user_id in target_users:
            # 유사 유저 상위 20명 추출
            similar_users = user_sim_df[user_id].sort_values(ascending=False)[1:21]
            sim_user_data = matrix.loc[similar_users.index]
            weights = similar_users.values.reshape(-1, 1)
            
            # 가중 평균 점수 계산
            weighted_scores = (sim_user_data * weights).sum(axis=0) / (weights.sum() + 1e-9)
            
            # 이미 구매한 상품 제외
            purchased = df_scores[df_scores['user_id'] == user_id]['product_id'].unique()
            recs = weighted_scores.drop(purchased, errors='ignore').sort_values(ascending=False).head(5)

            for rank, (p_id, score) in enumerate(recs.items(), 1):
                recommendation_data.append({
                    "u_id": int(user_id),
                    "p_id": int(p_id),
                    "rank": rank,
                    "score": float(score)
                })

        # 4. DB 대량 저장 (Bulk Insert)
        print(f"🚀 {len(recommendation_data)}건의 데이터를 DB에 전송 중...")
        with engine.connect() as conn:
            # 전체 초기화 (배치 작업이므로 기존 데이터를 비우고 시작하는 것이 깔끔합니다)
            conn.execute(text("TRUNCATE TABLE et_user_recommendation"))
            
            # 효율적인 대량 저장을 위한 쿼리
            insert_query = text("""
                INSERT INTO et_user_recommendation (USER_ID, PRODUCT_ID, RANK_NO, SCORE)
                VALUES (:u_id, :p_id, :rank, :score)
            """)
            
            # 리스트 형태의 데이터를 한꺼번에 처리
            conn.execute(insert_query, recommendation_data)
            conn.commit()

        print(f"✅ 대량 업데이트 완료! (소요 시간: {time.time() - start_time:.2f}초)")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    # 전체 유저 5,000명을 대상으로 실행
    run_batch_recommendations(limit_users=5000)
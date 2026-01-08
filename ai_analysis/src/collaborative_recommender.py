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

# MySQL DB 연결 설정 (사용자: enfant)
DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_db?charset=utf8mb4'
engine = create_engine(DB_URL)

def run_full_batch_recommendation_erd(top_n=5):
    try:
        start_time = time.time()
        print(f"🚀 [Enfant Terrible] ERD 기반 추천 배치 시작...")

        # 1. 전처리된 통합 점수 데이터 로딩
        df_scores = pd.read_csv(os.path.join(PROCESSED_PATH, "integrated_score_v2.csv"))
        
        # 2. 유저-아이템 행렬 및 유사도 계산 (기존 로직 유지)
        user_item_matrix = df_scores.pivot_table(index='user_id', columns='product_id', values='total_score').fillna(0)
        user_sim = cosine_similarity(user_item_matrix)
        user_sim_df = pd.DataFrame(user_sim, index=user_item_matrix.index, columns=user_item_matrix.index)
        
        # 3. 전체 유저 순회하며 추천 계산
        all_recommendations = []
        for target_user_id in user_item_matrix.index:
            similar_users = user_sim_df[target_user_id].sort_values(ascending=False)[1:11]
            sim_user_data = user_item_matrix.loc[similar_users.index]
            weights = similar_users.values.reshape(-1, 1)
            
            weighted_scores = (sim_user_data * weights).sum(axis=0) / (weights.sum() + 1e-9)
            purchased = df_scores[df_scores['user_id'] == target_user_id]['product_id'].unique()
            recommendations = weighted_scores.drop(purchased, errors='ignore').sort_values(ascending=False).head(top_n)

            # [수정] ERD 컬럼명에 맞춰 매핑 (RANK_NO -> rank)
            for r_idx, (p_id, score) in enumerate(recommendations.items(), 1):
                all_recommendations.append({
                    'user_id': int(target_user_id),
                    'product_id': int(p_id),
                    'rank': r_idx, # ERD 구조에 따른 컬럼명 변경
                    'score': float(score)
                })

        # 4. DB 대량 저장
        print(f"💾 MySQL 'et_user_recommendation' 테이블 업데이트 중...")
        with engine.connect() as conn:
            conn.execute(text("TRUNCATE TABLE et_user_recommendation;"))
            
            # [수정] rank는 예약어이므로 백틱(`)을 사용하여 쿼리 작성
            sql = text("""
                INSERT INTO et_user_recommendation (user_id, product_id, `rank`, score)
                VALUES (:user_id, :product_id, :rank, :score)
            """)
            
            conn.execute(sql, all_recommendations)
            conn.commit()
            
        print(f"✅ 배치 완료! (사용자 ID: enfant)")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    run_full_batch_recommendation_erd()
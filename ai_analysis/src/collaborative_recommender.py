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

# 1. MySQL DB 연결 설정 (DB 이름을 enfant_terrible로 변경)
DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_terrible?charset=utf8mb4'
engine = create_engine(DB_URL)

def run_full_batch_recommendation_erd(top_n=5):
    try:
        start_time = time.time()
        print(f"🚀 [Enfant Terrible] 신규 DB(enfant_terrible) 기반 추천 배치 시작...")

        # 1. 데이터 로딩
        file_path = os.path.join(PROCESSED_PATH, "integrated_score_v2.csv")
        if not os.path.exists(file_path):
            print(f"❌ 전처리된 파일이 없습니다: {file_path}")
            return
        df_scores = pd.read_csv(file_path)
        
        # 2. 유사도 계산
        user_item_matrix = df_scores.pivot_table(index='user_id', columns='product_id', values='total_score').fillna(0)
        user_sim = cosine_similarity(user_item_matrix)
        user_sim_df = pd.DataFrame(user_sim, index=user_item_matrix.index, columns=user_item_matrix.index)
        
        # 3. 추천 계산 및 리스트 생성
        all_recommendations = []
        for target_user_id in user_item_matrix.index:
            similar_users = user_sim_df[target_user_id].sort_values(ascending=False)[1:11]
            sim_user_data = user_item_matrix.loc[similar_users.index]
            weights = similar_users.values.reshape(-1, 1)
            
            weighted_scores = (sim_user_data * weights).sum(axis=0) / (weights.sum() + 1e-9)
            purchased = df_scores[df_scores['user_id'] == target_user_id]['product_id'].unique()
            recommendations = weighted_scores.drop(purchased, errors='ignore').sort_values(ascending=False).head(top_n)

            for r_idx, (p_id, score) in enumerate(recommendations.items(), 1):
                all_recommendations.append({
                    "user_id": int(target_user_id),
                    "product_id": int(p_id),
                    "rank": int(r_idx), # DB 테이블의 컬럼명과 일치해야 함
                    "score": float(round(score, 4))
                })

        # 4. DB 저장
        print(f"💾 MySQL 'et_user_recommendation' 테이블 업데이트 중...")
        result_df = pd.DataFrame(all_recommendations)

        with engine.begin() as conn:
            # 안전한 삭제를 위해 외래 키 체크 일시 해제
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            conn.execute(text("TRUNCATE TABLE et_user_recommendation;"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            
            # 데이터프레임을 DB 테이블에 직접 삽입
            result_df.to_sql(
                name='et_user_recommendation', 
                con=conn, 
                if_exists='append', 
                index=False,
                method='multi'
            )
            
        print(f"✨ 배치 완료! (소요 시간: {time.time() - start_time:.2f}초)")
        print(f"✅ DB 확인: {len(all_recommendations)}개의 데이터가 'enfant_terrible' DB에 저장되었습니다.")

    except Exception as e:
        print(f"❌ 오류 발생 상세: {e}")

if __name__ == "__main__":
    run_full_batch_recommendation_erd()
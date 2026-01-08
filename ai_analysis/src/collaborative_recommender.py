import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text
import os
import time
from datetime import datetime

# --- 경로 설정 ---
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
# 이전 단계에서 생성한 파일명(service_ready_data.csv)으로 맞춤
PROCESSED_PATH = os.path.join(base_dir, "data", "processed")

# 1. MySQL DB 연결 설정 (User: enfant)
DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_terrible?charset=utf8mb4'
engine = create_engine(DB_URL)

def run_full_batch_recommendation_erd(top_n=5):
    try:
        start_time = time.time()
        print(f"🚀 [Enfant Terrible] 실 서비스용 추천 배치 시스템 가동...")

        # 1. 전처리된 통합 데이터 로딩
        # 이전 전처리 단계에서 저장한 파일명을 사용하는 것이 안전합니다.
        file_path = os.path.join(PROCESSED_PATH, "service_ready_data.csv")
        if not os.path.exists(file_path):
            print(f"❌ 데이터 파일이 없습니다. 전처리 스크립트를 먼저 실행하세요: {file_path}")
            return
        
        # 'final_preference' 점수를 추천의 기준으로 사용합니다.
        df_scores = pd.read_csv(file_path)
        
        # 2. 유저-아이템 행렬 및 유사도 계산
        # 실제 서비스에서는 'final_preference'가 평점 역할을 합니다.
        user_item_matrix = df_scores.pivot_table(
            index='user_id', 
            columns='product_id', 
            values='final_preference'
        ).fillna(0)
        
        user_sim = cosine_similarity(user_item_matrix)
        user_sim_df = pd.DataFrame(user_sim, index=user_item_matrix.index, columns=user_item_matrix.index)
        
        # 3. 추천 계산 및 리스트 생성
        all_recommendations = []
        current_now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        for target_user_id in user_item_matrix.index:
            # 자기 자신을 제외한 유사 유저 상위 10명
            similar_users = user_sim_df[target_user_id].sort_values(ascending=False)[1:11]
            
            if similar_users.sum() == 0: continue # 유사도가 전혀 없는 경우 제외

            sim_user_data = user_item_matrix.loc[similar_users.index]
            weights = similar_users.values.reshape(-1, 1)
            
            # 가중 평균 점수 계산
            weighted_scores = (sim_user_data * weights).sum(axis=0) / (weights.sum() + 1e-9)
            
            # 이미 구매한 상품은 추천에서 제외 (df_scores 기준)
            purchased = df_scores[df_scores['user_id'] == target_user_id]['product_id'].unique()
            recommendations = weighted_scores.drop(purchased, errors='ignore').sort_values(ascending=False).head(top_n)

            for r_idx, (p_id, score) in enumerate(recommendations.items(), 1):
                all_recommendations.append({
                    "user_id": int(target_user_id),
                    "product_id": int(p_id),
                    "rank": int(r_idx),
                    "score": float(round(score, 4)),
                    "generated_at": current_now # ERD 상의 생성 시간 기록
                })

        # 4. DB 저장 (et_user_recommendation 테이블)
        if not all_recommendations:
            print("⚠️ 생성된 추천 데이터가 없습니다.")
            return

        print(f"💾 MySQL 'et_user_recommendation' 테이블 갱신 중...")
        result_df = pd.DataFrame(all_recommendations)

        with engine.begin() as conn:
            # 1단계: 외래 키 체크 일시 해제 후 기존 추천 내역 비우기
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            conn.execute(text("TRUNCATE TABLE et_user_recommendation;"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            
            # 2단계: 신규 추천 데이터 삽입
            result_df.to_sql(
                name='et_user_recommendation', 
                con=conn, 
                if_exists='append', 
                index=False,
                method='multi'
            )
            
        print(f"✨ 배치 완료! (소요 시간: {time.time() - start_time:.2f}초)")
        print(f"✅ DB 확인: {len(all_recommendations)}개의 추천 아이템이 'enfant_terrible' DB에 저장되었습니다.")

    except Exception as e:
        print(f"❌ 추천 배치 오류 발생: {e}")

if __name__ == "__main__":
    run_full_batch_recommendation_erd()
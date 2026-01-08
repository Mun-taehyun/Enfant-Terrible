import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
import os
import time

# --- 경로 설정 ---
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
PROCESSED_PATH = os.path.join(base_dir, "data", "processed")
if not os.path.exists(PROCESSED_PATH): os.makedirs(PROCESSED_PATH)

# DB 연결
DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_terrible?charset=utf8mb4'
engine = create_engine(DB_URL)

def preprocess_for_real_service():
    start_time = time.time()
    print("🧹 [Enfant Terrible] 실 서비스 연동용 데이터 전처리 시작...")

    try:
        with engine.connect() as conn:
            # A. 유저 반려견 속성 데이터 읽기
            print("📥 1/4: 유저 속성(EAV) 데이터 추출 중...")
            df_attr = pd.read_sql("SELECT user_id, attribute_id, value_number FROM et_user_attribute_value", conn)
            
            # B. 추천 기반 점수 데이터 읽기
            print("📥 2/4: 추천 점수 데이터 추출 중...")
            df_rec = pd.read_sql("SELECT user_id, product_id, score FROM et_user_recommendation", conn)

            # C. 리뷰 데이터 읽기 (테이블이 없을 경우 대비)
            try:
                df_review = pd.read_sql("SELECT user_id, product_id, rating FROM et_product_review", conn)
            except:
                df_review = pd.DataFrame(columns=['user_id', 'product_id', 'rating'])

        # 1. 추천 점수 유무 체크 (이게 없으면 추천 자체가 불가능)
        if df_rec.empty:
            print("❌ 오류: 추천 점수 데이터(et_user_recommendation)가 없습니다. data_pumping.py를 실행하세요.")
            return

        # 2. 프로필 데이터 변환 (세로형 -> 가로형)
        print("🔄 3/4: 반려견 프로필 구조 최적화 중...")
        attr_cols = ['dog_age', 'dog_size', 'dog_gender', 'dog_activity']
        
        if not df_attr.empty:
            df_profiles = df_attr.pivot(index='user_id', columns='attribute_id', values='value_number').reset_index()
            attr_map = {1: 'dog_age', 2: 'dog_size', 3: 'dog_gender', 4: 'dog_activity'}
            df_profiles = df_profiles.rename(columns=attr_map)
        else:
            # [수정] 속성 데이터가 없어도 구조를 유지하기 위해 빈 데이터프레임 생성
            print("⚠️ 속성 데이터가 비어 있어 기본값(0)으로 채웁니다.")
            df_profiles = pd.DataFrame(columns=['user_id'] + attr_cols)

        # 3. 데이터 통합
        print("🔗 4/4: 리뷰 및 프로필 통합 중...")
        
        # 리뷰 점수 병합 및 처리
        final_df = pd.merge(df_rec, df_review, on=['user_id', 'product_id'], how='left')
        final_df['rating'] = final_df['rating'].fillna(0)
        final_df['final_preference'] = final_df['score'] + (final_df['rating'] * 2)

        # 프로필 병합
        final_df = pd.merge(final_df, df_profiles, on='user_id', how='left')
        
        # 모든 결측치를 0으로 채움 (학습 에러 방지)
        final_df = final_df.fillna(0)

        # 4. 결과 저장
        output_file = os.path.join(PROCESSED_PATH, "integrated_score_v2.csv")
        final_df.to_csv(output_file, index=False, encoding='utf-8-sig')

        print(f"✨ 전처리 완료! (소요 시간: {time.time() - start_time:.2f}초)")
        print(f"📊 최종 데이터 건수: {len(final_df)}건")

    except Exception as e:
        print(f"❌ 전처리 중 오류 발생: {e}")

if __name__ == "__main__":
    preprocess_for_real_service()
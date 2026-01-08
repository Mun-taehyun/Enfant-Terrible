import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
import os
import time

# --- 경로 설정 (결과 저장용) ---
current_file_path = os.path.abspath(__file__) 
base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
PROCESSED_PATH = os.path.join(base_dir, "data", "processed")
if not os.path.exists(PROCESSED_PATH): os.makedirs(PROCESSED_PATH)

# 1. MySQL DB 연결 설정 수정 (DB 이름: enfant_terrible)
DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_terrible?charset=utf8mb4'
engine = create_engine(DB_URL)

def preprocess_from_db():
    start_time = time.time()
    # 2. 로그 메시지 수정
    print("🧹 [Enfant Terrible] enfant_terrible DB 기반 전처리 시작...")

    try:
        # 1. DB에서 데이터 읽기
        print("📥 1/4: 데이터베이스에서 직접 읽어오는 중...")
        with engine.connect() as conn:
            # 유저 속성값 (EAV 구조)
            df_attr = pd.read_sql("SELECT * FROM et_user_attribute_value", conn)
            # 추천 데이터 (기본 점수용)
            df_rec = pd.read_sql("SELECT user_id, product_id, score as total_score FROM et_user_recommendation", conn)

        # 2. 프로필 데이터 변환 (세로형 -> 가로형)
        print("🔄 2/4: 유저 프로필 구조 변환 중...")
        if not df_attr.empty:
            df_profiles = df_attr.pivot(index='user_id', columns='attribute_id', values='value_number').reset_index()
            # 실제 존재하는 컬럼 개수에 맞춰 이름 할당
            df_profiles.columns = ['user_id'] + [f'attr_{i}' for i in df_profiles.columns[1:]]
        else:
            print("⚠️ 속성 데이터가 비어 있습니다.")
            return

        # 3. 데이터 병합
        print("🔗 3/4: 통합 점수 데이터 생성 중...")
        final_df = df_rec.groupby(['user_id', 'product_id'])['total_score'].sum().reset_index()

        # 4. 결과 파일 저장
        print(f"💾 4/4: 전처리 결과 저장 중...")
        output_file = os.path.join(PROCESSED_PATH, "integrated_score_v2.csv")
        final_df.to_csv(output_file, index=False)

        print(f"✨ enfant_terrible DB 전처리 완료! (소요 시간: {time.time() - start_time:.2f}초)")
        print(f"📍 저장 위치: {output_file}")

    except Exception as e:
        print(f"❌ 전처리 중 오류 발생: {e}")

if __name__ == "__main__":
    preprocess_from_db()
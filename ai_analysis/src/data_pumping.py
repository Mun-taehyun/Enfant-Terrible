import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
import os

# [설정] 랜덤 시드 1 고정
np.random.seed(1)

# DB 연결 (User: enfant)
DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_terrible?charset=utf8mb4'
engine = create_engine(DB_URL)

def pump_initial_data():
    print(f"🚀 [Enfant Terrible] DB에 기초 활동 데이터 주입 중...")
    
    num_users = 100
    num_products = 100
    
    # 가상의 활동 데이터 (어떤 유저가 어떤 상품에 관심이 있었는지) 생성
    records = []
    for _ in range(1500): # 1500개의 활동 로그 생성
        records.append({
            'user_id': np.random.randint(1, num_users + 1),
            'product_id': np.random.randint(1, num_products + 1),
            'score': round(np.random.uniform(1.0, 5.0), 2)
        })
    
    df_rec = pd.DataFrame(records).drop_duplicates(['user_id', 'product_id'])
    
    with engine.begin() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        conn.execute(text("TRUNCATE TABLE et_user_recommendation;"))
        df_rec.to_sql('et_user_recommendation', con=conn, if_exists='append', index=False)
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        
    print(f"✅ DB 주입 완료! {len(df_rec)}건의 활동 데이터가 생성되었습니다.")

if __name__ == "__main__":
    pump_initial_data()
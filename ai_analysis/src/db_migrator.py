import pandas as pd
from sqlalchemy import create_engine
import os

def migrate_to_et_tables():
    # 1. 경로 자동 설정
    current_file_path = os.path.abspath(__file__) 
    base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
    CSV_PATH = os.path.join(base_dir, "data", "raw", "product_master.csv")

    # 2. [수정] MySQL DB 연결 설정
    # 형식: mysql+pymysql://사용자:비밀번호@호스트:포트/DB이름
    DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_db?charset=utf8mb4'
    engine = create_engine(DB_URL)

    try:
        if not os.path.exists(CSV_PATH):
            print(f"❌ CSV 파일이 없습니다: {CSV_PATH}")
            return

        # 3. 데이터 로드 및 전처리
        df = pd.read_csv(CSV_PATH)
        
        # [참고] MySQL은 관례적으로 소문자 컬럼명을 많이 사용하지만, 
        # 백엔드 Entity 구성에 따라 대문자로 유지해도 무방합니다.
        et_df = pd.DataFrame()
        et_df['PRODUCT_ID'] = df['product_id']
        et_df['NAME'] = df['product_name']
        et_df['BASE_PRICE'] = df['price']
        et_df['DESCRIPTION'] = df['category']
        et_df['PRODUCT_CODE'] = df['product_id'].apply(lambda x: f"ET-PROD-{x:05d}")
        # MySQL에서 NULL을 허용한다면 None 유지
        et_df['CATEGORY_ID'] = None 

        print(f"📊 {len(et_df)}건의 데이터를 ET_PRODUCT 형식으로 변환 완료.")

        # 4. [수정] DB 전송
        print("🚀 MySQL 'et_product' 테이블로 전송 중...")
        
        # MySQL 테이블 이름은 소문자로 생성하셨다면 'et_product'로 맞추는 것이 안전합니다.
        et_df.to_sql('et_product', con=engine, if_exists='append', index=False)
        print("✅ MySQL 마이그레이션 성공!")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    migrate_to_et_tables()
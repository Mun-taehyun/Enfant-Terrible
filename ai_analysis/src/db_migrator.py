import pandas as pd
from sqlalchemy import create_engine
import os

def migrate_to_et_tables():
    # 1. 경로 자동 설정 (새 프로젝트 구조 대응)
    # 현재 파일(db_migrator.py)의 절대 경로를 잡습니다.
    current_file_path = os.path.abspath(__file__) 
    # src의 상위 폴더인 ai_analysis 폴더를 기준(base_dir)으로 잡습니다.
    base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
    
    # 생성된 상품 마스터 CSV 파일의 경로를 잡습니다.
    CSV_PATH = os.path.join(base_dir, "data", "raw", "product_master.csv")

    # 2. Oracle DB 연결 설정 (Host: localhost, Service Name: xe)
    # 형식: oracle+cx_oracle://아이디:비밀번호@호스트:포트/?service_name=서비스이름
    DB_URL = 'oracle+cx_oracle://ENFANT:1234@localhost:1521/?service_name=xe'
    engine = create_engine(DB_URL)

    try:
        if not os.path.exists(CSV_PATH):
            print(f"❌ CSV 파일이 없습니다: {CSV_PATH}")
            print("먼저 product_generator.py를 실행하여 상품 데이터를 생성하세요.")
            return

        # 3. 데이터 로드 및 전처리
        df = pd.read_csv(CSV_PATH)
        
        # DB 구조(ET_PRODUCT)에 맞게 컬럼명 변경 및 데이터 가공
        # 오라클은 기본적으로 대문자 테이블/컬럼명을 선호하므로 대문자로 맞춥니다.
        et_df = pd.DataFrame()
        et_df['PRODUCT_ID'] = df['product_id']
        et_df['NAME'] = df['product_name']
        et_df['BASE_PRICE'] = df['price']
        et_df['DESCRIPTION'] = df['category']
        et_df['PRODUCT_CODE'] = df['product_id'].apply(lambda x: f"ET-PROD-{x:05d}")
        et_df['CATEGORY_ID'] = None # 추후 카테고리 관리 필요 시 사용

        print(f"📊 {len(et_df)}건의 데이터를 ET_PRODUCT 형식으로 변환 완료.")

        # 4. DB 전송 (ET_PRODUCT 테이블에 삽입)
        print("🚀 Oracle 'ET_PRODUCT' 테이블로 전송 중...")
        
        # if_exists='append'는 기존 데이터 뒤에 붙입니다. 
        # 만약 테이블을 비우고 새로 넣고 싶다면 'replace'를 쓰되 제약조건에 주의하세요.
        et_df.to_sql('et_product', con=engine, if_exists='append', index=False)
        print("✅ Oracle 마이그레이션 성공!")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    migrate_to_et_tables()
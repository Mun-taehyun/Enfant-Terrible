import pandas as pd
from sqlalchemy import create_engine, text
import os

def migrate_to_et_tables():
    # 1. 경로 설정
    current_file_path = os.path.abspath(__file__) 
    base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
    CSV_PATH = os.path.join(base_dir, "data", "raw", "product_master.csv")

    # 2. MySQL DB 연결 설정
    DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_db?charset=utf8mb4'
    engine = create_engine(DB_URL)

    try:
        if not os.path.exists(CSV_PATH):
            print(f"❌ CSV 파일이 없습니다: {CSV_PATH}")
            return

        # 3. 데이터 로드 및 변환
        df = pd.read_csv(CSV_PATH)
        
        et_df = pd.DataFrame()
        et_df['PRODUCT_ID'] = df['product_id']
        et_df['NAME'] = df['product_name']
        et_df['BASE_PRICE'] = df['price']
        et_df['DESCRIPTION'] = df['category']
        # 100개 규모이므로 코드를 좀 더 짧게 포맷팅 (001~100)
        et_df['PRODUCT_CODE'] = df['product_id'].apply(lambda x: f"ET-P-{x:03d}")
        et_df['CATEGORY_ID'] = 1 # None 대신 기본값 1을 넣어두면 Django에서 처리하기 편합니다.

        print(f"📊 {len(et_df)}건의 데이터를 ET_PRODUCT 형식으로 변환 완료.")

        # 4. [중요] 기존 데이터 삭제 후 새로 넣기
        with engine.connect() as conn:
            print("🧹 기존 테이블 데이터를 초기화합니다...")
            # 외래 키 제약 조건 잠시 해제 후 테이블 비우기
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            conn.execute(text("TRUNCATE TABLE et_product;"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            conn.commit()

        # 5. DB 전송
        print("🚀 MySQL 'et_product' 테이블로 전송 중...")
        # if_exists='append'로 유지 (위에서 비웠으므로 안전합니다)
        et_df.to_sql('et_product', con=engine, if_exists='append', index=False)
        print("✅ MySQL 마이그레이션 성공! (총 100개 상품 고정)")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    migrate_to_et_tables()
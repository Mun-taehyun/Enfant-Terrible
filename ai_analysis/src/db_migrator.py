import pandas as pd
from sqlalchemy import create_engine, text
import os

def migrate_to_et_tables_erd():
    # 1. 경로 설정
    current_file_path = os.path.abspath(__file__) 
    base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
    # 생성했던 ERD용 상품 마스터 로드
    CSV_PATH = os.path.join(base_dir, "data", "raw", "product_master_erd.csv")

    # 2. MySQL DB 연결 설정 수정 (DB 이름: enfant_terrible)
    DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_terrible?charset=utf8mb4'
    engine = create_engine(DB_URL)

    try:
        if not os.path.exists(CSV_PATH):
            print(f"❌ CSV 파일이 없습니다: {CSV_PATH}")
            return

        # 3. 데이터 로드
        df = pd.read_csv(CSV_PATH)
        
        # 4. [수정] ERD(et_product) 테이블 구조에 100% 맞게 매핑
        et_df = pd.DataFrame()
        et_df['product_id'] = df['product_id']
        et_df['category_id'] = df['category_id'] # 숫자 ID 사용
        et_df['product_code'] = df['product_code']
        et_df['name'] = df['name']
        et_df['description'] = df['description']
        et_df['base_price'] = df['base_price']

        # ⚠️ 중요: 만약 DB에 아래 컬럼들을 추가하지 않았다면 주석 처리하거나 제거해야 에러가 안 납니다.
        # et_df['image_url'] = df['image_url'] 

        print(f"📊 {len(et_df)}건의 데이터를 [enfant_terrible] 표준 형식으로 변환 완료.")

        # 5. 기존 데이터 초기화 (트랜잭션 보장을 위해 engine.begin() 권장)
        with engine.begin() as conn:
            print(f"🧹 'enfant_terrible' 내 기존 데이터를 안전하게 초기화 중...")
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            conn.execute(text("TRUNCATE TABLE et_product;"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            # engine.begin()은 자동으로 commit을 수행합니다.

        # 6. DB 전송
        print("🚀 MySQL 'et_product' 테이블로 전송 중...")
        et_df.to_sql('et_product', con=engine, if_exists='append', index=False)
        print("✅ enfant_terrible DB로 마이그레이션 성공!")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        print("💡 팁: 만약 'Unknown column' 에러가 나면 ERD에 없는 컬럼(image_url 등)을 코드에서 지우세요.")

if __name__ == "__main__":
    migrate_to_et_tables_erd()
import pandas as pd
from sqlalchemy import create_engine, text
import os
from datetime import datetime

def migrate_to_et_tables_erd():
    # 1. 경로 설정
    current_file_path = os.path.abspath(__file__) 
    base_dir = os.path.dirname(os.path.dirname(current_file_path)) 
    CSV_PATH = os.path.join(base_dir, "data", "raw", "product_master_erd.csv")

    # 2. DB 연결 (User: enfant)
    DB_URL = 'mysql+pymysql://enfant:1234@localhost:3306/enfant_terrible?charset=utf8mb4'
    engine = create_engine(DB_URL)

    try:
        if not os.path.exists(CSV_PATH):
            print(f"❌ CSV 파일이 없습니다: {CSV_PATH}")
            return

        # 3. 데이터 로드
        df = pd.read_csv(CSV_PATH)
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # 4. [수정] ERD(et_product) 테이블 구조와 100% 매칭
        # 이미지에 정의된 모든 컬럼을 포함해야 실제 사이트 연동 시 에러가 없습니다.
        et_df = pd.DataFrame()
        et_df['product_id'] = df['product_id']
        et_df['category_id'] = df['category_id']
        et_df['product_code'] = df['product_code']
        et_df['name'] = df['name']
        et_df['description'] = df['description']
        et_df['base_price'] = df['base_price']
        
        # --- ERD 필수 메타데이터 추가 ---
        # 실제 사이트 로직상 'SALE' 상태가 아니면 상품이 노출되지 않을 수 있습니다.
        if 'status' in df.columns:
            et_df['status'] = df['status']
        else:
            et_df['status'] = 'SALE'
            
        et_df['created_at'] = current_time
        et_df['updated_at'] = current_time

        print(f"📊 {len(et_df)}건의 데이터를 'et_product' 표준 형식으로 변환 완료.")

        # 5. DB 초기화 및 전송 (안전한 트랜잭션 처리)
        with engine.begin() as conn:
            print(f"🧹 'enfant_terrible' 기존 데이터 초기화 중 (FK 제약 무시)...")
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            conn.execute(text("TRUNCATE TABLE et_product;"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            
            print("🚀 'et_product' 테이블로 마이그레이션 중...")
            # method='multi'를 사용하여 대량 데이터 입력 속도 최적화
            et_df.to_sql('et_product', con=conn, if_exists='append', index=False, method='multi')
            
        print("✅ enfant_terrible DB 마이그레이션 성공!")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        print("💡 팁: 'Unknown column' 에러 발생 시 DB의 실제 컬럼명과 코드의 key값이 일치하는지 확인하세요.")

if __name__ == "__main__":
    migrate_to_et_tables_erd()
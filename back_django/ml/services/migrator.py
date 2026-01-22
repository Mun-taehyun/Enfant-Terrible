import os
import sys
import django
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime
from pathlib import Path

# --- Django 환경 초기화 ---
current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent 
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings') 
django.setup()
# -------------------------

from django.conf import settings

def migrate_to_et_tables_latest():
    # 로그 및 CSV 경로 설정
    LOGS_PATH = Path(settings.BASE_DIR).parent / "logs"
    CSV_PATH = LOGS_PATH / "product_master_erd.csv"

    # [수정 포인트] 사용자 'kosmo'와 스키마 'kosmo'을 명시적으로 지정
    # 만약 비밀번호가 다르다면 아래 'password' 부분을 실제 비밀번호로 수정하세요.
    DB_USER = "kosmo"
    DB_PASS = "1234"  # 실제 사용 중인 비밀번호로 변경 필수
    DB_HOST = "localhost"
    DB_PORT = "3306"
    DB_NAME = "kosmo"

    # 직접 URL 구성 (환경 변수 오류 방지)
    DB_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    engine = create_engine(DB_URL, pool_pre_ping=True)

    try:
        if not os.path.exists(CSV_PATH):
            print(f"❌ CSV 파일이 없습니다: {CSV_PATH}")
            return

        # CSV 로드
        df = pd.read_csv(CSV_PATH)
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # 랜덤 시드 1 고정 (요청 사항 반영)
        import numpy as np
        np.random.seed(1)
        
        print(f"📊 {len(df)}건의 데이터를 최신 'et_product' 스키마 형식으로 변환 시작...")

        # --- 데이터 프레임 구성 ---
        et_df = pd.DataFrame()
        et_df['product_id'] = df['product_id']
        et_df['category_id'] = df['category_id']
        et_df['product_code'] = df['product_code']
        et_df['name'] = df['name']
        et_df['status'] = 'ON_SALE' 
        et_df['base_price'] = df['base_price']
        et_df['description'] = df['description']
        et_df['average_rating'] = 0.0
        et_df['review_count'] = 0
        et_df['created_at'] = current_time
        et_df['updated_at'] = current_time
        
        # --- DB 트랜잭션 ---
        with engine.begin() as conn:
            # 1. 외래키 체크 해제
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            
            # 2. 기존 데이터 정리 (테이블 존재 확인 후 실행)
            conn.execute(text("TRUNCATE TABLE et_product;"))
            
            # 3. 데이터 삽입
            et_df.to_sql(
                name='et_product', 
                con=conn, 
                if_exists='append', 
                index=False, 
                method='multi',
                chunksize=1000
            )
            
            # 4. 외래키 체크 재활성화
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            
        print("✅ 마이그레이션 성공! 'et_product' 테이블에 데이터가 정상적으로 삽입되었습니다.")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        print("💡 팁: 'et_product' 테이블이 실제로 'kosmo' DB 안에 생성되었는지 워크벤치에서 확인하세요.")

if __name__ == "__main__":
    migrate_to_et_tables_latest()
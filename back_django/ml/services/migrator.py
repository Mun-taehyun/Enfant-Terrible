import os
import sys
import django
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from datetime import datetime
from pathlib import Path
from urllib.parse import quote_plus

# --- Django 환경 초기화 ---
current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent 
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings') 
django.setup()

from django.conf import settings

def migrate_to_et_tables_latest():
    LOGS_PATH = Path(settings.BASE_DIR).parent / "logs"
    PROD_CSV = LOGS_PATH / "product_master_erd.csv"
    CAT_CSV = LOGS_PATH / "category_master.csv" # 카테고리 파일 추가

    db_conf = settings.DATABASES['default']
    u = db_conf.get('USER')
    p = db_conf.get('PASSWORD') or ""
    h = db_conf.get('HOST')
    port = db_conf.get('PORT')
    db_name = db_conf.get('NAME')

    safe_pw = quote_plus(str(p))
    db_url = f"mysql+pymysql://{u}:{safe_pw}@{h}:{port}/{db_name}?charset=utf8mb4"
    engine = create_engine(db_url, pool_pre_ping=True)

    try:
        # 파일 존재 확인
        if not PROD_CSV.exists() or not CAT_CSV.exists():
            print(f"❌ CSV 파일이 부족합니다. generator.py를 먼저 실행하세요.")
            return

        # 데이터 로드
        df_prod = pd.read_csv(PROD_CSV)
        df_cat = pd.read_csv(CAT_CSV)
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        np.random.seed(1)
        
        print(f"📊 카테고리 {len(df_cat)}건, 상품 {len(df_prod)}건 변환 시작...")

        with engine.begin() as conn:
            # 1. 외래키 체크 해제 및 기존 데이터 정리
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            conn.execute(text("TRUNCATE TABLE et_product;"))
            conn.execute(text("TRUNCATE TABLE et_category;"))
            
            # 2. 카테고리 데이터 먼저 삽입 (부모 데이터)
            df_cat.to_sql(name='et_category', con=conn, if_exists='append', index=False)
            print("📁 et_category 삽입 완료")
            
            # 3. 상품 데이터 삽입 (자식 데이터)
            df_prod.to_sql(
                name='et_product', 
                con=conn, 
                if_exists='append', 
                index=False, 
                method='multi',
                chunksize=1000
            )
            print("📦 et_product 삽입 완료")
            
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            
        print("✅ 마이그레이션 성공! 이제 깨끗한 데이터로 추천 시스템을 돌릴 수 있습니다.")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    migrate_to_et_tables_latest()
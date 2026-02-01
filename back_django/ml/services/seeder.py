import os
import sys
import random
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path
from urllib.parse import quote_plus

# --- Django 환경 초기화 ---
current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent 
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.conf import settings
from sqlalchemy import create_engine, text

# [개인화 설정] 랜덤 시드 1 고정
random.seed(1)
np.random.seed(1)

def get_db_engine():
    db_conf = settings.DATABASES['default']
    u = db_conf.get('USER')
    p = db_conf.get('PASSWORD') or ""
    h = db_conf.get('HOST')
    port = db_conf.get('PORT')
    db_name = db_conf.get('NAME')

    safe_pw = quote_plus(str(p))
    db_url = f"mysql+pymysql://{u}:{safe_pw}@{h}:{port}/{db_name}?charset=utf8mb4"
    return create_engine(db_url, pool_pre_ping=True)

def seed_recommendations(engine):
    # 경로 수정: logs 폴더 내의 파일을 참조하도록 변경
    log_dir = Path(settings.BASE_DIR).parent / "logs"
    csv_path = log_dir / "service_ready_data.csv"
    
    if not csv_path.exists():
        print(f"⚠️ {csv_path.name} 파일이 없어 추천 데이터 로드를 건너뜁니다.")
        return

    print(f"🤖 AI 추천 데이터를 로드합니다: {csv_path.name}")
    df = pd.read_csv(csv_path)
    df = df.rename(columns={'final_preference': 'score'})
    df = df.sort_values(by=['user_id', 'score'], ascending=[True, False])
    df['rank_no'] = df.groupby('user_id')['score'].rank(method='first', ascending=False).astype(int)
    
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE TABLE et_user_recommendation"))
        df.to_sql('et_user_recommendation', con=conn, if_exists='append', index=False)
    print(f"✅ 추천 데이터 {len(df)}건 세팅 완료!")

def seed_orders_operational(truncate_all: bool = False):
    engine = get_db_engine()
    log_dir = Path(settings.BASE_DIR).parent / "logs"

    with engine.begin() as conn:
        # 0) 기존 데이터 초기화 (순서 중요)
        if truncate_all:
            print(f"🧹 [kosmo DB] 완전 초기화 중...")
            conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
            # et_category 추가
            tables = ["et_user_recommendation", "et_product_review", "et_order_item", 
                      "et_payment", "et_order", "et_product_sku", "et_product", 
                      "et_user", "et_category"]
            for t in tables:
                try: conn.execute(text(f"TRUNCATE TABLE {t}"))
                except: pass
            conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))

        # 1) 카테고리 확보 및 삽입 (추가된 부분)
        cat_csv = log_dir / "category_master.csv"
        if cat_csv.exists():
            df_cat = pd.read_csv(cat_csv)
            df_cat.to_sql('et_category', con=conn, if_exists='append', index=False)
            print("📁 카테고리 데이터 삽입 완료")
        else:
            print("❌ 카테고리 CSV 파일을 찾을 수 없습니다.")
            return

        # 2) 상품 확보 (CSV 기반)
        prod_csv = log_dir / "product_master_erd.csv"
        if prod_csv.exists():
            df_prod = pd.read_csv(prod_csv)
            df_prod.to_sql('et_product', con=conn, if_exists='append', index=False)
            product_rows = conn.execute(text("SELECT product_id, base_price FROM et_product")).fetchall()
            print("📦 상품 데이터 삽입 완료")
        else:
            print("❌ 상품 CSV 파일을 찾을 수 없습니다.")
            return

        # 3) SKU 생성
        ins_sku = [{"p_id": p[0], "code": f"SKU-{p[0]}-01", "price": int(p[1])} for p in product_rows]
        conn.execute(text("""
            INSERT INTO et_product_sku (product_id, sku_code, price, stock, status) 
            VALUES (:p_id, :code, :price, 999, 'ON_SALE')
        """), ins_sku)

        # 4) 사용자 생성 (100명)
        users = [{"email": f"user{i}@example.com", "name": f"사용자{i}"} for i in range(1, 101)]
        conn.execute(text("""
            INSERT INTO et_user (email, password, name, role, status) 
            VALUES (:email, 'hashed_password_123', :name, 'USER', 'ACTIVE')
        """), users)

    # 5) AI 추천 데이터 로드
    seed_recommendations(engine)
    print(f"✨ 모든 작업이 완료되었습니다! (User: kosmo)")

if __name__ == "__main__":
    seed_orders_operational(truncate_all=True)
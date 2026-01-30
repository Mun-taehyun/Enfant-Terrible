import os
import sys
import random
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path

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

# [개인화 설정] 랜덤 시드 1 고정 및 kosmo 통일
random.seed(1)
np.random.seed(1)
PROJECT_NAME = "kosmo"

def get_db_engine():
    # [핵심] SQL_MODE를 비워줌으로써 잘못된 데이터 입력 시 에러 대신 NULL/기본값으로 처리하게 합니다.
    u, p, h, port, db = 'kosmo', '1234', '127.0.0.1', '3306', 'kosmo'
    db_url = f"mysql+pymysql://{u}:{p}@{h}:{port}/{db}?charset=utf8mb4"
    return create_engine(db_url, connect_args={"init_command": "SET sql_mode=''"})

def seed_recommendations(engine):
    """최종 추천 결과를 DB에 반영"""
    log_dir = Path(settings.BASE_DIR).parent / "logs"
    csv_path = log_dir / "service_ready_data.csv" 
    
    if not csv_path.exists():
        print(f"⚠️ {csv_path.name} 파일이 없어 추천 데이터 로드를 건너뜜")
        return

    df = pd.read_csv(csv_path).fillna(0)
    if 'final_preference' in df.columns:
        df = df.rename(columns={'final_preference': 'score'})
    
    df = df.sort_values(by=['user_id', 'score'], ascending=[True, False])
    df['rank_no'] = df.groupby('user_id')['score'].rank(method='first', ascending=False).astype(int)
    df['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE TABLE et_user_recommendation"))
        df[['user_id', 'product_id', 'score', 'rank_no', 'created_at']].to_sql(
            'et_user_recommendation', con=conn, if_exists='append', index=False
        )
    print(f"✅ AI 추천 데이터 세팅 완료!")

def seed_kosmo_operational(truncate_all: bool = False):
    engine = get_db_engine()
    log_dir = Path(settings.BASE_DIR).parent / "logs"
    GITHUB_IMG_BASE = "https://raw.githubusercontent.com/Mun-taehyun/Enfant-Terrible/main/back_django/media/product-images/"

    with engine.begin() as conn:
        if truncate_all:
            print(f"🧹 [{PROJECT_NAME} DB] 전체 데이터 초기화 중...")
            conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
            tables = ["et_user_recommendation", "et_product_review", "et_order_item", 
                      "et_payment", "et_order", "et_product_sku", "et_product", 
                      "et_user", "et_category"]
            for t in tables:
                try: conn.execute(text(f"TRUNCATE TABLE {t}"))
                except: pass
            conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))

        # 1) 카테고리 삽입 (해결 포인트: parent_id 숫자 변환 및 강제 NULL 처리)
        cat_csv = log_dir / "category_master.csv"
        if cat_csv.exists():
            df_cat = pd.read_csv(cat_csv)
            # 숫자가 아닌 값은 강제로 NaN으로 바꾸고, MySQL NULL(None)로 변환
            df_cat['parent_id'] = pd.to_numeric(df_cat['parent_id'], errors='coerce').replace({np.nan: None})
            df_cat.to_sql('et_category', con=conn, if_exists='append', index=False)
            print("📁 카테고리 데이터 삽입 성공")
        
        # 2) 상품 삽입 (이미지 주소 매칭 포함)
        prod_csv = log_dir / "product_master.csv"
        if prod_csv.exists():
            df_prod = pd.read_csv(prod_csv).fillna("")
            df_prod.columns = [c.strip().lower() for c in df_prod.columns]
            
            def map_image_url(row):
                base_desc = str(row['description']) if row['description'] else "상품 상세 설명"
                img_num = str(row['product_code']).split('-')[-1]
                img_url = f"{GITHUB_IMG_BASE}product-{img_num}.png"
                return f"{base_desc} ||IMG_URL||:{img_url}"

            df_prod['description'] = df_prod.apply(map_image_url, axis=1)
            target_cols = ['product_id', 'category_id', 'product_code', 'name', 'status', 'base_price', 'description', 'created_at']
            valid_df = df_prod[[c for c in target_cols if c in df_prod.columns]]
            valid_df.to_sql('et_product', con=conn, if_exists='append', index=False)
            print(f"📦 상품 데이터 {len(valid_df)}건 삽입 성공")
        
        # 3) SKU 생성
        product_rows = conn.execute(text("SELECT product_id, base_price FROM et_product")).fetchall()
        if product_rows:
            ins_sku = [{"p_id": p[0], "code": f"SKU-{p[0]}-01", "price": int(p[1])} for p in product_rows]
            conn.execute(text("""
                INSERT INTO et_product_sku (product_id, sku_code, price, stock, status) 
                VALUES (:p_id, :code, :price, 999, 'ON_SALE')
            """), ins_sku)
            print("🔧 상품 SKU 생성 완료")

        # 4) 사용자 생성
        users = [{"email": f"user{i}@example.com", "name": f"코스모유저{i}"} for i in range(1, 101)]
        conn.execute(text("""
            INSERT INTO et_user (email, password, name, role, status) 
            VALUES (:email, 'hashed_pw', :name, 'USER', 'ACTIVE')
        """), users)
        print(f"👥 기본 사용자 100명 생성 완료")

    # 5) AI 추천 결과 세팅
    seed_recommendations(engine)
    print(f"✨ 모든 작업이 완료되었습니다!")

if __name__ == "__main__":
    seed_kosmo_operational(truncate_all=True)
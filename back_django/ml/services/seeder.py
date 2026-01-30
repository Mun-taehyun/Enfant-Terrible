import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
from sqlalchemy import create_engine, text

# --- Django 환경 초기화 ---
current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent 
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.conf import settings

def get_db_engine():
    db_url = "mysql+pymysql://kosmo:1234@127.0.0.1:3306/kosmo?charset=utf8mb4"
    return create_engine(db_url, connect_args={"init_command": "SET sql_mode=''"})

def seed_recommendations(conn, log_dir):
    """AI 추천 데이터를 et_user_recommendation 테이블에 연동"""
    csv_path = log_dir / "service_ready_data.csv"
    if not csv_path.exists():
        return

    df = pd.read_csv(csv_path)
    # 컬럼명 통일 및 랭킹 계산
    if 'final_preference' in df.columns:
        df = df.rename(columns={'final_preference': 'score'})
    
    df = df.sort_values(by=['user_id', 'score'], ascending=[True, False])
    df['rank_no'] = df.groupby('user_id')['score'].rank(method='first', ascending=False).astype(int)
    df['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    try:
        conn.execute(text("TRUNCATE TABLE et_user_recommendation"))
        target_df = df[['user_id', 'product_id', 'score', 'rank_no', 'created_at']]
        target_df.to_sql('et_user_recommendation', con=conn, if_exists='append', index=False)
        conn.commit()
        print(f"✅ AI 추천 데이터 {len(target_df)}건 연동 완료")
    except:
        pass

def seed_kosmo_operational(truncate_all: bool = False):
    engine = get_db_engine()
    log_dir = Path(settings.BASE_DIR).parent / "logs"
    GITHUB_IMG_BASE = "https://raw.githubusercontent.com/Mun-taehyun/Enfant-Terrible/main/back_django/media/product-images/"

    with engine.connect() as conn:
        if truncate_all:
            print("🧹 DB 초기화 중...")
            conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
            for t in ["et_user_recommendation", "et_product_sku", "et_product", "et_user", "et_category"]:
                conn.execute(text(f"TRUNCATE TABLE {t}"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))
            conn.commit()

        # 1) 카테고리 삽입
        cat_csv = log_dir / "category_master.csv"
        if cat_csv.exists():
            df_cat = pd.read_csv(cat_csv)
            for _, row in df_cat.iterrows():
                try:
                    p_id = row['parent_id'] if pd.notnull(row['parent_id']) else None
                    conn.execute(text("""
                        INSERT INTO et_category (category_id, parent_id, name, depth, sort_order) 
                        VALUES (:cid, :pid, :name, :depth, :sort)
                    """), {"cid": row['category_id'], "pid": p_id, "name": row['name'], "depth": row['depth'], "sort": row['sort_order']})
                    conn.commit()
                except: continue
            print(f"📁 카테고리 {len(df_cat)}건 세팅 완료")

        # 2) 상품 삽입
        prod_csv = log_dir / "product_master.csv"
        if prod_csv.exists():
            df_prod = pd.read_csv(prod_csv)
            for _, row in df_prod.iterrows():
                try:
                    img_num = str(row['product_code']).split('-')[-1]
                    img_url = f"{GITHUB_IMG_BASE}product-{img_num}.png"
                    desc = f"{row['description']} ||IMG_URL||:{img_url}"
                    conn.execute(text("""
                        INSERT INTO et_product (product_id, category_id, product_code, name, base_price, description, status) 
                        VALUES (:pid, :cid, :pcode, :name, :price, :desc, 'ON_SALE')
                    """), {"pid": row['product_id'], "cid": row['category_id'], "pcode": row['product_code'], 
                           "name": row['name'], "price": row['base_price'], "desc": desc})
                    conn.commit()
                except: continue
            print(f"📦 상품 {len(df_prod)}건 및 이미지 매칭 완료")

        # 3) SKU 생성
        p_rows = conn.execute(text("SELECT product_id, base_price FROM et_product")).fetchall()
        for p in p_rows:
            try:
                conn.execute(text("""
                    INSERT INTO et_product_sku (product_id, sku_code, price, stock, status) 
                    VALUES (:pid, :code, :price, 999, 'ON_SALE')
                """), {"pid": p[0], "code": f"SKU-{p[0]}-01", "price": p[1]})
                conn.commit()
            except: continue
        print(f"🔧 SKU {len(p_rows)}건 생성 완료")

        # 4) 유저 생성
        for i in range(1, 101):
            try:
                conn.execute(text("""
                    INSERT INTO et_user (email, password, name, role, status) 
                    VALUES (:email, '1234', :name, 'USER', 'ACTIVE')
                """), {"email": f"user{i}@test.com", "name": f"코스모유저{i}"})
                conn.commit()
            except: continue
        print("👥 테스트 유저 100명 생성 완료")

        # 5) AI 추천 데이터 연동
        seed_recommendations(conn, log_dir)

    print("\n🚀 [성공] 모든 데이터베이스 세팅이 완료되었습니다.")

if __name__ == "__main__":
    seed_kosmo_operational(truncate_all=True)
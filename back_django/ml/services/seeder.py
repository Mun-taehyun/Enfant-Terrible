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
    now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

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

        # 4) 사용자 생성 (관리자 원본 정보 반영)
        print("👥 유저 데이터 생성 중...")
        
        # (1) 이미지(image_9ed437.png)의 관리자 계정 정보 복구
        admin_data = {
            "user_id": 3,
            "email": "kasd178515@gmail.com",
            "password": "$2a$10$WUAkbUT6uZl6v/p9lu.1vO0dQ8XWUV...", # 이미지의 해시값
            "name": "박종원",
            "tel": "010-2222-1111",
            "zip_code": "06035",
            "address_base": "서울 강남구 가로수길 5",
            "address_detail": "ㅇㅇ",
            "email_verified": "Y",
            "provider": "local",
            "status": "ACTIVE",
            "role": "ADMIN",
            "last_login_at": "2026-01-29 19:42:31",
            "created_at": "2026-01-29 19:41:40",
            "updated_at": "2026-01-29 19:52:42"
        }
        
        try:
            conn.execute(text("""
                INSERT INTO et_user (
                    user_id, email, password, name, tel, zip_code, address_base, 
                    address_detail, email_verified, provider, status, role, 
                    last_login_at, created_at, updated_at
                ) VALUES (
                    :user_id, :email, :password, :name, :tel, :zip_code, :address_base, 
                    :address_detail, :email_verified, :provider, :status, :role, 
                    :last_login_at, :created_at, :updated_at
                )
            """), admin_data)
            conn.commit()
            print(f"👑 관리자 계정({admin_data['name']}) 원본 정보로 생성 완료")
        except: pass

        # (2) 나머지 테스트 유저 생성
        for i in range(1, 101):
            if i == 3: continue # 관리자 ID와 중복 방지
            try:
                conn.execute(text("""
                    INSERT INTO et_user (
                        email, password, name, role, status, email_verified, provider, created_at
                    ) VALUES (
                        :email, '1234', :name, 'USER', 'ACTIVE', 'Y', 'local', :now
                    )
                """), {
                    "email": f"user{i}@test.com", 
                    "name": f"코스모유저{i}", 
                    "now": now_str
                })
                conn.commit()
            except: continue
        print("👥 테스트용 일반 유저 생성 완료")

        # 5) AI 추천 데이터 연동
        seed_recommendations(conn, log_dir)

    print("\n🚀 [성공] 모든 데이터베이스 세팅이 완료되었습니다.")

if __name__ == "__main__":
    seed_kosmo_operational(truncate_all=True)
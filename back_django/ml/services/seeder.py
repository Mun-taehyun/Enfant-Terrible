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

# [개인화 설정] 랜덤 시드 1 고정
random.seed(1)
np.random.seed(1)

def get_db_engine():
    db_conf = settings.DATABASES['default']
    # 사용자 ID 'enfant' 반영 및 DB 설정 정보 로드
    u = db_conf.get('USER', 'enfant') 
    p = db_conf['PASSWORD']
    h = db_conf['HOST']
    port = db_conf['PORT']
    db_name = db_conf['NAME']
    
    db_url = f"mysql+pymysql://{u}:{p}@{h}:{port}/{db_name}?charset=utf8mb4"
    return create_engine(db_url, pool_pre_ping=True)

def seed_orders_operational(truncate_all: bool = False):
    engine = get_db_engine()
    log_dir = Path(settings.BASE_DIR).parent / "logs"

    with engine.begin() as conn:
        # 0) 기존 데이터 초기화 (스키마 순서 고려)
        if truncate_all:
            print(f"🧹 [kosmo DB] 완전 초기화 중...")
            conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
            tables = ["et_user_recommendation", "et_product_review", "et_order_item", 
                      "et_payment", "et_order", "et_product_sku", "et_product", 
                      "et_user", "et_category"]
            for t in tables:
                try: conn.execute(text(f"TRUNCATE TABLE {t}"))
                except: pass
            conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))

        # 1) 카테고리 삽입
        cat_csv = log_dir / "category_master.csv"
        if cat_csv.exists():
            df_cat = pd.read_csv(cat_csv)
            df_cat.to_sql('et_category', con=conn, if_exists='append', index=False)
            print("📁 카테고리 데이터 삽입 완료")

        # 2) 상품 삽입
        prod_csv = log_dir / "product_master_erd.csv"
        if prod_csv.exists():
            df_prod = pd.read_csv(prod_csv)
            df_prod.to_sql('et_product', con=conn, if_exists='append', index=False)
            print("📦 상품 데이터 삽입 완료")
        
        # 3) SKU 생성 (SKU가 있어야 주문이 가능함)
        product_rows = conn.execute(text("SELECT product_id, base_price FROM et_product")).fetchall()
        for p in product_rows:
            conn.execute(text("""
                INSERT INTO et_product_sku (product_id, sku_code, price, stock, status) 
                VALUES (:p_id, :code, :price, 999, 'ON_SALE')
            """), {"p_id": p[0], "code": f"SKU-{p[0]}-01", "price": int(p[1])})
        
        sku_rows = conn.execute(text("SELECT sku_id, product_id, price FROM et_product_sku")).fetchall()

        # 4) 사용자 생성 (100명)
        for i in range(1, 101):
            conn.execute(text("""
                INSERT INTO et_user (email, password, name, role, status) 
                VALUES (:email, 'hashed_password_123', :name, 'USER', 'ACTIVE')
            """), {"email": f"user{i}@example.com", "name": f"사용자{i}"})
        
        user_ids = [r[0] for r in conn.execute(text("SELECT user_id FROM et_user")).fetchall()]

        # 5) 가짜 주문 및 리뷰 데이터 생성 (분석용 재료)
        print("🛒 추천 분석용 주문/리뷰 데이터를 생성 중...")
        for u_id in user_ids:
            # 유저당 2~4개 상품 구매
            sampled_skus = random.sample(sku_rows, random.randint(2, 4))
            
            for s_id, p_id, price in sampled_skus:
                # [수정] total_amount 컬럼명 반영
                conn.execute(text("""
                    INSERT INTO et_order (user_id, order_status, total_amount, ordered_at) 
                    VALUES (:u_id, 'DELIVERED', :amount, NOW())
                """), {"u_id": u_id, "amount": price})
                
                # 생성된 order_id 가져오기
                order_id = conn.execute(text("SELECT LAST_INSERT_ID()")).fetchone()[0]

                # 주문 상세 데이터
                conn.execute(text("""
                    INSERT INTO et_order_item (order_id, sku_id, price, quantity) 
                    VALUES (:o_id, :s_id, :price, 1)
                """), {"o_id": order_id, "s_id": s_id, "price": price})

                # [중요] 리뷰 데이터 생성 (주문 ID 필수 참조 반영)
                conn.execute(text("""
                    INSERT INTO et_product_review (user_id, product_id, order_id, rating, content, created_at) 
                    VALUES (:u_id, :p_id, :o_id, :rating, '만족합니다!', NOW())
                """), {"u_id": u_id, "p_id": p_id, "o_id": order_id, "rating": random.randint(4, 5)})

    print(f"✅ 가짜 데이터 생성 완료! (유저: {len(user_ids)}명)")
    print(f"✨ 이제 브라우저에서 /api/admin/recommendation/update/ 를 호출하세요.")

if __name__ == "__main__":
    seed_orders_operational(truncate_all=True)
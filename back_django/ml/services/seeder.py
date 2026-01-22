import os
import sys
import random
import numpy as np
from datetime import datetime, timedelta
from uuid import uuid4
from pathlib import Path

# --- Django 환경 초기화 ---
current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent 

if str(project_root) not in sys.path:
    sys.path.append(str(project_root))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()
# -------------------------

from django.conf import settings
from sqlalchemy import create_engine, text

# [개인화 설정] 랜덤 시드 1로 고정
random.seed(1)
np.random.seed(1)

def get_db_engine():
    """MySQL 접속 정보 (계정: kosmo, DB: kosmo 강제 지정)"""
    db_conf = settings.DATABASES['default']
    
    # 변수들을 함수 밖에서도 참조할 수 있게 하거나, 여기서 바로 리턴합니다.
    u = 'kosmo'  
    p = db_conf['PASSWORD']
    h = db_conf['HOST']
    port = db_conf['PORT']
    db_name = 'kosmo'  
    
    db_url = f"mysql+pymysql://{u}:{p}@{h}:{port}/{db_name}?charset=utf8mb4"
    
    print(f"📡 DB 접속 시도: {h}:{port} | DB: {db_name} | User: {u}")
    return create_engine(db_url, pool_pre_ping=True)

def seed_orders_operational(
    num_orders: int = 500,
    review_ratio: float = 0.4,
    truncate_orders: bool = False,
    min_users_if_empty: int = 100,
    min_products_if_empty: int = 50,
):
    engine = get_db_engine()

    with engine.begin() as conn:
        # 0) 기존 데이터 삭제
        if truncate_orders:
            print(f"🧹 [kosmo] 기존 주문 및 리뷰 데이터를 초기화합니다...")
            conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
            
            tables_to_truncate = ["et_product_review", "et_order_item", "et_payment", "et_order"]
            for t in tables_to_truncate:
                try:
                    conn.execute(text(f"TRUNCATE TABLE {t}"))
                except Exception:
                    print(f"⚠️ {t} 테이블이 없어 건너뜁니다.")
            
            conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))

        # 1) 사용자 확보
        user_rows = conn.execute(text("SELECT user_id FROM et_user WHERE status='ACTIVE'")).fetchall()
        user_ids = [r[0] for r in user_rows]
        
        if not user_ids:
            print("👤 활성 사용자가 없어 샘플 사용자를 생성합니다.")
            rows = []
            for i in range(1, min_users_if_empty + 1):
                rows.append({
                    "email": f"user{i}@example.com", "password": "hashed_password_123",
                    "name": f"사용자{i}", "role": "USER", "status": "ACTIVE"
                })
            conn.execute(text("INSERT INTO et_user (email, password, name, role, status) VALUES (:email, :password, :name, :role, :status)"), rows)
            user_ids = [r[0] for r in conn.execute(text("SELECT user_id FROM et_user")).fetchall()]

        # 2) 상품 확보
        products = conn.execute(text("SELECT product_id, name, base_price FROM et_product WHERE deleted_at IS NULL")).fetchall()
        if not products:
            print("📦 상품 데이터가 없어 샘플 상품을 생성합니다.")
            rows = []
            for i in range(1, min_products_if_empty + 1):
                rows.append({
                    "product_code": f"P{i:05d}", "name": f"샘플상품_{i}",
                    "base_price": random.randint(8000, 80000), "status": "ON_SALE",
                    "average_rating": 0.0, "review_count": 0
                })
            conn.execute(text("INSERT INTO et_product (product_code, name, base_price, status, average_rating, review_count) VALUES (:product_code, :name, :base_price, :status, :average_rating, :review_count)"), rows)
            products = conn.execute(text("SELECT product_id, name, base_price FROM et_product")).fetchall()

        # 3) SKU 확보
        sku_rows = conn.execute(text("""
            SELECT ps.sku_id, ps.product_id, ps.price, p.name 
            FROM et_product_sku ps 
            JOIN et_product p ON p.product_id = ps.product_id
        """)).fetchall()

        if not sku_rows:
            print("🎫 SKU 데이터가 없어 기본 SKU를 생성합니다.")
            ins = []
            for p in products:
                ins.append({
                    "product_id": p[0], "sku_code": f"SKU-{p[0]}-01",
                    "price": int(p[2]), "stock": 999, "status": "ON_SALE"
                })
            conn.execute(text("INSERT INTO et_product_sku (product_id, sku_code, price, stock, status) VALUES (:product_id, :sku_code, :price, :stock, :status)"), ins)
            sku_rows = conn.execute(text("SELECT ps.sku_id, ps.product_id, ps.price, p.name FROM et_product_sku ps JOIN et_product p ON ps.product_id = p.product_id")).fetchall()

        # 4) 주문 및 리뷰 생성
        orders, item_pending, review_pending = [], [], []
        now = datetime.now()

        print(f"📝 {num_orders}건의 가짜 데이터를 생성 중...")
        for _ in range(num_orders):
            user_id = random.choice(user_ids)
            sku_id, product_id, price, product_name = random.choice(sku_rows)
            qty = random.randint(1, 3)
            order_code = f"ORD-{uuid4().hex[:12].upper()}"
            ordered_at = now - timedelta(days=random.randint(1, 365))

            orders.append({
                "user_id": user_id, "order_code": order_code, "order_status": "PAID",
                "total_amount": int(price) * qty, "delivery_status": "DELIVERED", "ordered_at": ordered_at
            })
            item_pending.append({
                "order_code": order_code, "sku_id": sku_id, "product_name": product_name,
                "price": price, "quantity": qty
            })

            if random.random() < review_ratio:
                review_pending.append({
                    "order_code": order_code, "user_id": user_id, "product_id": product_id,
                    "rating": random.choice([3, 4, 5, 5, 5]),
                    "content": random.choice(["정말 좋아요!", "배송도 빠르고 품질도 만족합니다.", "강력 추천해요.", "우리 아이가 너무 좋아해요!"]),
                    "created_at": ordered_at + timedelta(days=random.randint(2, 7))
                })

        # 데이터 대량 삽입
        if orders:
            conn.execute(text("INSERT INTO et_order (user_id, order_code, order_status, total_amount, delivery_status, ordered_at) VALUES (:user_id, :order_code, :order_status, :total_amount, :delivery_status, :ordered_at)"), orders)
            order_id_map = {r[1]: r[0] for r in conn.execute(text("SELECT order_id, order_code FROM et_order")).fetchall()}

            final_items = [{"order_id": order_id_map[it["order_code"]], "sku_id": it["sku_id"], "product_name": it["product_name"], "price": it["price"], "quantity": it["quantity"]} for it in item_pending if it["order_code"] in order_id_map]
            conn.execute(text("INSERT INTO et_order_item (order_id, sku_id, product_name, price, quantity) VALUES (:order_id, :sku_id, :product_name, :price, :quantity)"), final_items)

            if review_pending:
                final_reviews = [{"user_id": rv["user_id"], "product_id": rv["product_id"], "order_id": order_id_map[rv["order_code"]], "rating": rv["rating"], "content": rv["content"], "created_at": rv["created_at"]} for rv in review_pending if rv["order_code"] in order_id_map]
                conn.execute(text("INSERT INTO et_product_review (user_id, product_id, order_id, rating, content, created_at) VALUES (:user_id, :product_id, :order_id, :rating, :content, :created_at)"), final_reviews)

        # 5) 통계 동기화
        print("📈 상품 통계(평점/리뷰수)를 최신화합니다...")
        sync_sql = """
            UPDATE et_product p
            LEFT JOIN (
                SELECT product_id, COUNT(*) as cnt, AVG(rating) as avg_r
                FROM et_product_review
                GROUP BY product_id
            ) r ON p.product_id = r.product_id
            SET p.review_count = IFNULL(r.cnt, 0),
                p.average_rating = IFNULL(r.avg_r, 0.0)
        """
        conn.execute(text(sync_sql))

        # 에러 유발 지점 수정: 변수명을 직접 문자로 쓰거나 engine에서 가져옵니다.
        print(f"✅ 데이터 생성이 성공적으로 완료되었습니다! (DB: {engine.url.database})")

if __name__ == "__main__":
    seed_orders_operational(num_orders=500, truncate_orders=True)
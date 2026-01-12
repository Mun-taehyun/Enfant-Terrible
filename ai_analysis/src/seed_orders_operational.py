# ai_analysis/src/seed_orders_operational.py
# 전처리에 필요한 DB를 채워주는 파일

from __future__ import annotations

import os
import random
from datetime import datetime, timedelta
from uuid import uuid4
from dotenv import load_dotenv

from sqlalchemy import create_engine, text

load_dotenv()


def _must_env(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"{name} 환경변수가 없습니다.")
    return v


def _has_col(conn, table: str, col: str) -> bool:
    row = conn.execute(
        text(
            """
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = :t
              AND column_name = :c
            LIMIT 1
            """
        ),
        {"t": table, "c": col},
    ).first()
    return row is not None


def _count(conn, table: str) -> int:
    return int(conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar() or 0)


def seed_orders_operational(
    num_orders: int = 500,
    review_ratio: float = 0.4,
    truncate_orders: bool = False,
    min_users_if_empty: int = 100,
    min_products_if_empty: int = 50,
):
    db_url = _must_env("ENFANT_TERRIBLE_URL")
    engine = create_engine(db_url, pool_pre_ping=True)

    with engine.begin() as conn:
        # 0) 주문 관련 테이블만 비우기(선택)
        if truncate_orders:
            # FK 때문에 삭제 순서 중요
            conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
            for t in ["et_product_review", "et_order_item", "et_payment", "et_order"]:
                # 테이블이 없을 수도 있으니 예외 없이 진행하려면 IF EXISTS가 TRUNCATE에 안 먹어서 DELETE 사용
                try:
                    conn.execute(text(f"DELETE FROM {t}"))
                except Exception:
                    pass
            conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))

        # 1) 사용자 확보
        user_where = ""
        if _has_col(conn, "et_user", "deleted_at"):
            user_where = "WHERE deleted_at IS NULL"
        user_ids = [r[0] for r in conn.execute(text(f"SELECT user_id FROM et_user {user_where}")).fetchall()]

        if not user_ids:
            rows = []
            for i in range(1, min_users_if_empty + 1):
                rows.append(
                    {
                        "email": f"user{i}@example.com",
                        "password": "hashed_password_123",
                        "name": f"사용자{i}",
                        "role": "USER",
                    }
                )
            conn.execute(
                text(
                    """
                    INSERT INTO et_user (email, password, name, role)
                    VALUES (:email, :password, :name, :role)
                    """
                ),
                rows,
            )
            user_ids = [r[0] for r in conn.execute(text("SELECT user_id FROM et_user")).fetchall()]

        # 2) 상품 확보
        prod_where = ""
        if _has_col(conn, "et_product", "deleted_at"):
            prod_where = "WHERE deleted_at IS NULL"
        products = conn.execute(
            text(f"SELECT product_id, name, COALESCE(base_price, 10000) AS base_price FROM et_product {prod_where}")
        ).fetchall()

        if not products:
            rows = []
            for i in range(1, min_products_if_empty + 1):
                base_price = random.randint(8000, 80000)
                rows.append(
                    {
                        "product_code": f"P{i:05d}",
                        "name": f"상품_{i}",
                        "base_price": base_price,
                        "description": "seed product",
                    }
                )
            conn.execute(
                text(
                    """
                    INSERT INTO et_product (product_code, name, base_price, description)
                    VALUES (:product_code, :name, :base_price, :description)
                    """
                ),
                rows,
            )
            products = conn.execute(
                text("SELECT product_id, name, COALESCE(base_price, 10000) AS base_price FROM et_product")
            ).fetchall()

        # 3) SKU 확보 (et_order_item이 sku_id 구조라서 필수)
        sku_rows = conn.execute(
            text(
                """
                SELECT ps.sku_id, ps.product_id, COALESCE(ps.price, p.base_price, 10000) AS price, p.name
                FROM et_product_sku ps
                JOIN et_product p ON p.product_id = ps.product_id
                """
            )
        ).fetchall()

        if not sku_rows:
            ins = []
            for (product_id, name, base_price) in [(p[0], p[1], p[2]) for p in products]:
                ins.append(
                    {
                        "product_id": product_id,
                        "sku_code": f"SKU-{product_id}-01",
                        "price": int(base_price),
                        "stock": 999999,
                        "status": "SALE",
                    }
                )
            conn.execute(
                text(
                    """
                    INSERT INTO et_product_sku (product_id, sku_code, price, stock, status)
                    VALUES (:product_id, :sku_code, :price, :stock, :status)
                    """
                ),
                ins,
            )
            sku_rows = conn.execute(
                text(
                    """
                    SELECT ps.sku_id, ps.product_id, COALESCE(ps.price, p.base_price, 10000) AS price, p.name
                    FROM et_product_sku ps
                    JOIN et_product p ON p.product_id = ps.product_id
                    """
                )
            ).fetchall()

        # 4) 주문/주문아이템 생성
        #    - et_order는 user_id만 NOT NULL
        #    - et_order_item은 order_id, sku_id NOT NULL
        orders = []
        item_pending = []   # 나중에 order_id 매핑
        review_pending = [] # 나중에 order_id 매핑

        now = datetime.now()
        for _ in range(num_orders):
            user_id = random.choice(user_ids)
            sku_id, product_id, price, product_name = random.choice(sku_rows)
            qty = random.randint(1, 3)

            order_code = uuid4().hex
            ordered_at = now - timedelta(days=random.randint(0, 365), hours=random.randint(0, 23))

            orders.append(
                {
                    "user_id": user_id,
                    "order_code": order_code,
                    "order_status": "PAID",
                    "total_amount": int(price) * qty,
                    "delivery_status": "DELIVERED",
                    "ordered_at": ordered_at.strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

            item_pending.append(
                {
                    "order_code": order_code,
                    "sku_id": int(sku_id),
                    "product_name": str(product_name),
                    "price": int(price),
                    "quantity": int(qty),
                }
            )

            if random.random() < review_ratio:
                review_pending.append(
                    {
                        "order_code": order_code,
                        "user_id": int(user_id),
                        "product_id": int(product_id),
                        "rating": random.choices([1, 2, 3, 4, 5], weights=[5, 5, 10, 30, 50], k=1)[0],
                        "content": random.choice(
                            [
                                "강아지가 너무 잘 먹어요!",
                                "사이즈도 딱 맞고 재질이 좋네요.",
                                "배송이 빠릅니다.",
                                "내구성이 살짝 아쉽지만 만족해요.",
                                "우리 아이 최애 장난감이 됐어요!",
                            ]
                        ),
                        "created_at": (ordered_at + timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d %H:%M:%S"),
                    }
                )

        conn.execute(
            text(
                """
                INSERT INTO et_order (user_id, order_code, order_status, total_amount, delivery_status, ordered_at)
                VALUES (:user_id, :order_code, :order_status, :total_amount, :delivery_status, :ordered_at)
                """
            ),
            orders,
        )

        # order_code -> order_id 매핑
        # (IN 절이 너무 길어질 수 있어 chunk)
        order_id_map = {}
        codes = [o["order_code"] for o in orders]
        chunk = 200
        for i in range(0, len(codes), chunk):
            part = codes[i : i + chunk]
            # SQLAlchemy에서 IN 바인딩을 안전하게 처리
            rows = conn.execute(
                text(
                    """
                    SELECT order_id, order_code
                    FROM et_order
                    WHERE order_code IN :codes
                    """
                ).bindparams(
                    codes=tuple(part)
                )
            ).fetchall()
            for order_id, order_code in rows:
                order_id_map[str(order_code)] = int(order_id)

        order_items = []
        for it in item_pending:
            oid = order_id_map.get(it["order_code"])
            if not oid:
                continue
            order_items.append(
                {
                    "order_id": oid,
                    "sku_id": it["sku_id"],
                    "product_name": it["product_name"],
                    "price": it["price"],
                    "quantity": it["quantity"],
                }
            )

        conn.execute(
            text(
                """
                INSERT INTO et_order_item (order_id, sku_id, product_name, price, quantity)
                VALUES (:order_id, :sku_id, :product_name, :price, :quantity)
                """
            ),
            order_items,
        )

        # 5) 리뷰 생성(선택)
        if review_pending:
            reviews = []
            for rv in review_pending:
                oid = order_id_map.get(rv["order_code"])
                if not oid:
                    continue
                reviews.append(
                    {
                        "user_id": rv["user_id"],
                        "product_id": rv["product_id"],
                        "order_id": oid,
                        "rating": rv["rating"],
                        "content": rv["content"],
                        "created_at": rv["created_at"],
                    }
                )

            conn.execute(
                text(
                    """
                    INSERT INTO et_product_review (user_id, product_id, order_id, rating, content, created_at)
                    VALUES (:user_id, :product_id, :order_id, :rating, :content, :created_at)
                    """
                ),
                reviews,
            )

        # 결과 출력용(확인)
        o_cnt = _count(conn, "et_order")
        oi_cnt = _count(conn, "et_order_item")
        r_cnt = _count(conn, "et_product_review")
        print(f"[seed] et_order={o_cnt}, et_order_item={oi_cnt}, et_product_review={r_cnt}")
        print("[seed] DONE")


if __name__ == "__main__":
    # 운영 테스트 기본값: 주문 500건, 리뷰 40%
    seed_orders_operational(
        num_orders=int(os.getenv("SEED_NUM_ORDERS", "500")),
        review_ratio=float(os.getenv("SEED_REVIEW_RATIO", "0.4")),
        truncate_orders=(os.getenv("SEED_TRUNCATE_ORDERS", "0").strip() in ("1", "true", "yes")),
    )

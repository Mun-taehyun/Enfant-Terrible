import os
import sys
import argparse
import random
from datetime import datetime, timedelta
from pathlib import Path

current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django

django.setup()

from django.db import connection, transaction


def _pick_review_content(rating: int) -> str:
    rating = int(rating)
    if rating >= 5:
        return random.choice([
            "좋아요. 아주 좋습니다.",
            "정말 만족해요. 좋아요!",
            "품질이 좋아요. 추천합니다.",
            "재구매 의사 있어요. 좋습니다.",
        ])
    if rating == 4:
        return random.choice([
            "좋아요.",
            "대체로 만족합니다.",
            "무난하게 좋습니다.",
            "생각보다 괜찮아요.",
        ])
    if rating == 3:
        return random.choice([
            "보통이에요.",
            "무난합니다.",
            "가격 대비 보통입니다.",
            "그럭저럭이에요.",
        ])
    if rating == 2:
        return random.choice([
            "아쉬워요.",
            "별로에요.",
            "기대보다 안좋아요.",
            "재구매는 안할 것 같아요.",
        ])
    return random.choice([
        "안좋아요.",
        "실망했어요. 안좋아요.",
        "추천하지 않습니다.",
        "품질이 기대 이하였어요.",
    ])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--orders", type=int, default=1000)
    ap.add_argument("--reviews", type=int, default=1000)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    random.seed(int(args.seed))

    orders_n = int(args.orders)
    reviews_n = int(args.reviews)
    apply = bool(args.apply)

    with connection.cursor() as c:
        c.execute("SELECT user_id FROM et_user ORDER BY user_id")
        user_ids = [int(r[0]) for r in c.fetchall()]
        if not user_ids:
            raise SystemExit("No users in et_user")

        c.execute("SELECT sku_id, product_id, price FROM et_product_sku WHERE deleted_at IS NULL ORDER BY sku_id")
        sku_rows = [(int(r[0]), int(r[1]), int(r[2])) for r in c.fetchall()]
        if not sku_rows:
            raise SystemExit("No SKUs in et_product_sku")

    now = datetime.now()

    with transaction.atomic():
        created_orders: list[tuple[int, int, int]] = []  # (order_id, user_id, product_id)

        with connection.cursor() as c:
            for i in range(orders_n):
                user_id = random.choice(user_ids)
                sku_id, product_id, price = random.choice(sku_rows)
                qty = random.randint(1, 3)

                total_amount = price * qty

                order_code = f"CF-{now.strftime('%Y%m%d%H%M%S')}-{i:06d}-{random.randint(1000,9999)}"
                receiver_name = f"수령인{user_id}"
                receiver_phone = f"010-{random.randint(1000,9999)}-{random.randint(1000,9999)}"
                zip_code = f"{random.randint(10000, 99999)}"
                address_base = "서울시"
                address_detail = f"{random.randint(1, 200)}동 {random.randint(1, 200)}호"

                ordered_at = now - timedelta(days=random.randint(0, 30), minutes=random.randint(0, 60 * 24))

                c.execute(
                    """
                    INSERT INTO et_order (
                      user_id,
                      order_code,
                      order_status,
                      total_amount,
                      receiver_name,
                      receiver_phone,
                      zip_code,
                      address_base,
                      address_detail,
                      ordered_at,
                      delivery_status,
                      tracking_number,
                      shipped_at,
                      delivered_at
                    ) VALUES (
                      %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
                    )
                    """,
                    [
                        user_id,
                        order_code,
                        "DELIVERED",
                        total_amount,
                        receiver_name,
                        receiver_phone,
                        zip_code,
                        address_base,
                        address_detail,
                        ordered_at,
                        "DELIVERED",
                        f"TRK{random.randint(10000000,99999999)}",
                        ordered_at + timedelta(days=1),
                        ordered_at + timedelta(days=3),
                    ],
                )
                order_id = int(c.lastrowid)

                c.execute(
                    """
                    INSERT INTO et_order_item (
                      order_id,
                      sku_id,
                      product_name,
                      price,
                      quantity,
                      cancelled_quantity
                    ) VALUES (%s,%s,%s,%s,%s,%s)
                    """,
                    [
                        order_id,
                        sku_id,
                        f"상품{product_id}",
                        price,
                        qty,
                        0,
                    ],
                )

                created_orders.append((order_id, user_id, product_id))

                if (i + 1) % 100 == 0:
                    print(f"created_orders={i+1}/{orders_n}")

            created_reviews = 0
            used_pairs: set[tuple[int, int]] = set()

            for _ in range(reviews_n * 3):
                if created_reviews >= reviews_n:
                    break

                order_id, user_id, product_id = random.choice(created_orders)
                pair = (order_id, product_id)
                if pair in used_pairs:
                    continue
                used_pairs.add(pair)

                rating = random.choices([1, 2, 3, 4, 5], weights=[5, 10, 25, 30, 30], k=1)[0]
                content = _pick_review_content(rating)

                c.execute(
                    """
                    INSERT INTO et_product_review (
                      user_id,
                      product_id,
                      order_id,
                      rating,
                      content
                    ) VALUES (%s,%s,%s,%s,%s)
                    """,
                    [user_id, product_id, order_id, rating, content],
                )

                created_reviews += 1

                if created_reviews % 200 == 0:
                    print(f"created_reviews={created_reviews}/{reviews_n}")

        if not apply:
            transaction.set_rollback(True)

    print(
        f"orders={orders_n} reviews={reviews_n} applied={apply} "
        f"(created_orders={len(created_orders)} created_reviews={created_reviews})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

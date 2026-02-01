import os
import sys
import argparse
import random
from datetime import datetime
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
    ap.add_argument("--count", type=int, default=40)
    ap.add_argument("--seed", type=int, default=43)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    random.seed(int(args.seed))
    target = int(args.count)
    apply = bool(args.apply)

    # 리뷰가 없는(DELIVERED) 주문-상품 페어를 뽑아서 그만큼만 채운다.
    # et_order_item -> sku -> product_id
    with connection.cursor() as c:
        c.execute(
            """
            SELECT
              o.order_id,
              o.user_id,
              ps.product_id
            FROM et_order o
            JOIN et_order_item oi ON oi.order_id = o.order_id
            JOIN et_product_sku ps ON ps.sku_id = oi.sku_id
            LEFT JOIN et_product_review r
              ON r.order_id = o.order_id
             AND r.product_id = ps.product_id
             AND r.deleted_at IS NULL
            WHERE o.order_status = 'DELIVERED'
              AND r.review_id IS NULL
            ORDER BY o.order_id DESC
            LIMIT %s
            """,
            [target],
        )
        rows = [(int(r[0]), int(r[1]), int(r[2])) for r in c.fetchall()]

    if not rows:
        print("no missing reviews")
        return 0

    inserted = 0
    with transaction.atomic():
        with connection.cursor() as c:
            for order_id, user_id, product_id in rows:
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
                inserted += 1

        if not apply:
            transaction.set_rollback(True)

    print(f"inserted_missing_reviews={inserted} applied={apply} at={datetime.now().isoformat(timespec='seconds')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

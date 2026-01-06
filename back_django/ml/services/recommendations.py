# ml/services/recommendations.py
# 함수 계산 부분만 따로 뺌

from django.db import connection
from django.db.models import Count, Avg
from ml.models import UserRecommendation


def popular_products(product_id: int, limit: int) -> list[dict]:
    limit = max(1, min(int(limit),50))

    with connection.cursor()as c:
        c.execute(
            """
            SELECT ps.product_id,
                   SUM(COALESCE(oi.quantity, 1)) AS sold_qty
            FROM et_order_item oi
            JOIN et_product_sku ps ON ps.sku_id = oi.sku_id
            JOIN et_product p ON p.product_id = ps.product_id
            JOIN et_order o ON o.order_id = oi.order_id
            WHERE p.deleted_at IS NULL
              AND o.deleted_at IS NULL
              AND ps.product_id <> %s
            GROUP BY ps.product_id
            ORDER BY sold_qty DESC, ps.product_id DESC
            LIMIT %s

            """,
            [product_id, limit],
        )
        rows = c.fetchall()
    
    if rows :
        return[
            {"productId": int(pid), "score": float(review_cnt or 0)}
            for (pid, review_cnt) in rows
        ]

    with connection.cursor() as c:
        c.execute(
            """
            SELECT product_id
            FROM et_product
            WHERE deleted_at IS NULL
              AND product_id <> %s
            ORDER BY created_at DESC, product_id DESC
            LIMIT %s
            """,
            [product_id, limit],
        )
        ids = [row[0] for row in c.fetchall()]

    return [{"productId": int(pid), "score": 0.0} for pid in ids]


def recommend_core(product_id: int, limit: int) -> list[dict]:
    # 1) 이 상품(product_id)이 추천된 유저 집합
    base_users = (
        UserRecommendation.objects
        .filter(product_id=product_id)
        .values_list("user_id", flat=True)
        .distinct()
    )

    if not base_users:
        return popular_products(product_id,limit)

    # 2) 그 유저들에게 함께 추천된 다른 상품 집계
    rows = (
        UserRecommendation.objects
        .filter(user_id__in=base_users)
        .exclude(product_id=product_id)
        .values("product_id")
        .annotate(
            user_cnt=Count("user_id", distinct=True),
            avg_score=Avg("score"),
        )
        .order_by("-user_cnt", "-avg_score")[:limit]
    )

    # 3) API 응답 형태로 변환
    return [
        {"productId": int(r["product_id"]), "score": float(r["avg_score"] or 0.0)}
        for r in rows
    ]
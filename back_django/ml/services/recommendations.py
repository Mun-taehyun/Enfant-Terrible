# ml/services/recommendations.py
# 추천 읽어주는 파일. 없으면 인기 상품 보여 줌

from django.db import connection
from django.db.utils import OperationalError, ProgrammingError
from ml.models import UserRecommendation

def popular_products(limit:int) -> list[dict]:
    """
    개인 추천 결과 없을 때 보여줄 '전체 인기 상품'
    주문/판매 테이블이 없거나 비어있으면 최신 상품으로 보여줌
    어차피 나중에 교체 될 거다
    """
    limit = max(1,min(int(limit),50))

    # 판매량 기반 상품
    try :
        with connection.cursor() as c:
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
                GROUP BY ps.product_id
                ORDER BY sold_qty DESC, ps.product_id DESC
                LIMIT %s
                """,
                [limit]
            )
            rows = c.fetchall()

        if rows :
            return [
                {"productId": int(pid), "score": float(sold_qty or 0)}
                for (pid, sold_qty) in rows
            ]
    except (OperationalError, ProgrammingError):
        pass

    #없으면 최신상품으로
    try:
        with connection.cursor() as c:
            c.execute(
                """
                SELECT p.product_id
                FROM et_product p
                WHERE p.deleted_at IS NULL
                ORDER BY p.created_at DESC, p.product_id DESC
                LIMIT %s
                """,
                [limit],
            )
            rows = c.fetchall()

        return [{"productId": int(pid), "score": 0.0} for (pid,) in rows]

    except (OperationalError, ProgrammingError):
        return []


def recommend_for_user(user_id: int, limit: int) -> list[dict]:
    limit = max(1, min(int(limit), 50))

    qs = (
        UserRecommendation.objects
        .filter(user_id=user_id)
        .order_by("rank_no", "-score", "recommendation_id")
        .values_list("product_id", "score")[:limit]
    )

    rows = list(qs)  # 여기서 실제 조회가 일어납니다.

    if rows:
        return [{"productId": int(pid), "score": float(score or 0.0)} for (pid, score) in rows]

    return popular_products(limit)

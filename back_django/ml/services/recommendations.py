from django.db import connection
from django.db.utils import OperationalError, ProgrammingError
from ml.models import UserRecommendation

def popular_products(limit: int) -> list[dict]:
    """
    개인 추천 결과가 없을 때 보여줄 '전체 인기 상품'
    판매량(70%) + 평점(30%) 가중치 기반
    """
    limit = max(1, min(int(limit), 50))

    try:
        with connection.cursor() as c:
            # [성능 팁] COALESCE를 사용하여 null 값을 0으로 처리
            c.execute(
                """
                SELECT 
                    p.product_id,
                    (SUM(COALESCE(oi.quantity, 0)) * 0.7 + p.average_rating * 10) AS popularity_score
                FROM et_product p
                LEFT JOIN et_product_sku ps ON p.product_id = ps.product_id
                LEFT JOIN et_order_item oi ON ps.sku_id = oi.sku_id
                WHERE p.deleted_at IS NULL
                  AND p.status = 'ON_SALE'
                GROUP BY p.product_id
                ORDER BY popularity_score DESC, p.product_id DESC
                LIMIT %s
                """,
                [limit]
            )
            rows = c.fetchall()

        if rows:
            return [
                {"productId": int(pid), "score": float(score or 0.0)}
                for (pid, score) in rows
            ]
    except (OperationalError, ProgrammingError) as e:
        print(f"Popular products query error: {e}")

    # 데이터가 없거나 에러 시 최신 상품 반환
    try:
        with connection.cursor() as c:
            c.execute(
                """
                SELECT product_id
                FROM et_product
                WHERE deleted_at IS NULL AND status = 'ON_SALE'
                ORDER BY created_at DESC, product_id DESC
                LIMIT %s
                """,
                [limit],
            )
            rows = c.fetchall()
        return [{"productId": int(pid), "score": 0.0} for (pid,) in rows]
    except (OperationalError, ProgrammingError):
        return []

def recommend_for_user(user_id: int, limit: int) -> list[dict]:
    """
    특정 사용자 맞춤 추천 (et_user_recommendation 테이블)
    """
    limit = max(1, min(int(limit), 50))

    try:
        # Django ORM 사용 시 필드명 주의 (models.py와 일치해야 함)
        # 만약 에러가 난다면 values_list("product_id", "score") 부분을 확인하세요.
        qs = (
            UserRecommendation.objects
            .filter(user_id=user_id)
            .order_by("rank_no", "-score")
            .values_list("product_id", "score")[:limit]
        )
        
        rows = list(qs)
        if rows:
            return [
                {"productId": int(pid), "score": float(score or 0.0)} 
                for (pid, score) in rows
            ]
    except Exception as e:
        print(f"Recommendation table error: {e}")

    # 개인화 데이터 없으면 인기 상품으로 대체
    return popular_products(limit)
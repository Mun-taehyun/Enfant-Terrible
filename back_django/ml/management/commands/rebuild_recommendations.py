# rebuild_recommendations.py
# 배치하기 위한 함수 저장 파일


from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Optional, Tuple

from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.db.utils import OperationalError, ProgrammingError


# 입력값이 크거나 틀릴 때, 적절한 범위로 돌리는 함수들이다.
# 가져올 갯수의 한계를 정해주고, DB에서 뒤져볼 날짜의 한계를 정해준다. 너무 많은 양 뒤지면 느려지니까.
def _clamp_limit(limit: int, default: int = 50, max_limit: int = 50) -> int:
    try:
        n = int(limit)
    except (TypeError, ValueError):
        return default
    if n <= 0:
        return default
    return min(n, max_limit)


def _clamp_days(days: int, default: int = 180, max_days: int = 3650) -> int:
    try:
        n = int(days)
    except (TypeError, ValueError):
        return default
    if n <= 0:
        return default
    return min(n, max_days)

# 하드코딩 하는 이유는 일단 AI가 시켜서 하긴 했는데 이렇게 고정 시켜두면 나중에 따로 설정 안 해줘도 되니까 놔둠
@dataclass(frozen=True)
class ProductScore:
    product_id: int
    score: float


# 
class Command(BaseCommand):
    """
    et_user_recommendation 채우는 배치 커맨드

    현재 추천 테이블이 비어있다고 하셨으니,
    우선 "전체 인기상품 TOP N"으로 유저별 추천을 채워 넣습니다.
    나중에 전처리/ML 결과가 생기면, _build_recos_for_user() 로직만 교체하면 됩니다.
    """

    help = "Rebuild et_user_recommendation (daily batch)."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=50, help="recommendations per user (1~50)")
        parser.add_argument("--days", type=int, default=180, help="popularity lookback window (days)")
        parser.add_argument("--user-id", type=int, default=None, help="rebuild only one user_id")
        parser.add_argument("--dry-run", action="store_true", help="do not write to DB")
        parser.add_argument("--truncate", action="store_true", help="TRUNCATE et_user_recommendation before insert")

    def handle(self, *args, **opts):
        limit = _clamp_limit(opts.get("limit", 50))
        days = _clamp_days(opts.get("days", 180))
        user_id = opts.get("user_id")
        dry_run = bool(opts.get("dry_run"))
        truncate = bool(opts.get("truncate"))

        self.stdout.write(
            f"[rebuild_recommendations] limit={limit} days={days} user_id={user_id} dry_run={dry_run} truncate={truncate}"
        )

        # 1) 전체 인기상품 TOP 리스트 준비(판매량 기반 -> 없으면 최신상품)
        popular = self._get_popular_products(limit=limit, days=days)
        if not popular:
            self.stdout.write("[WARN] popular products list is empty. recommendations will be empty.")
        else:
            self.stdout.write(f"[INFO] popular products loaded: {len(popular)} items")

        # 2) 대상 유저 목록
        if user_id is not None:
            users = [int(user_id)]
        else:
            users = self._get_all_user_ids_best_effort()
        self.stdout.write(f"[INFO] target users: {len(users)}")

        if dry_run:
            for uid in users[:10]:
                recos = self._build_recos_for_user(uid, popular, limit)
                self.stdout.write(f"[DRY] user_id={uid} recos={len(recos)}")
            self.stdout.write("[DRY] skipping DB writes.")
            return

        # 3) 쓰기 (truncate 옵션이면 한 번에 비움)
        if truncate:
            self._truncate_recommendation_table()

        updated = 0
        for uid in users:
            recos = self._build_recos_for_user(uid, popular, limit)
            self._write_user_recos(uid, recos)
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"[DONE] updated_users={updated}"))

    # ----------------------------
    # 읽기: 유저 목록
    # ----------------------------
    def _get_all_user_ids_best_effort(self) -> List[int]:
        """
        테이블 컬럼이 팀 작업에 따라 바뀔 수 있어서,
        최대한 안전한 순서로 user_id 목록을 확보합니다.

        우선순위:
        1) et_user.user_id 전부
        2) 주문 테이블(et_order)에서 distinct user_id
        """
        # 1) et_user
        try:
            with connection.cursor() as c:
                c.execute("SELECT user_id FROM et_user")
                rows = c.fetchall()
            users = [int(r[0]) for r in rows if r and r[0] is not None]
            if users:
                return users
        except (OperationalError, ProgrammingError):
            pass

        # 2) et_order
        try:
            with connection.cursor() as c:
                c.execute("SELECT DISTINCT user_id FROM et_order WHERE user_id IS NOT NULL")
                rows = c.fetchall()
            users = [int(r[0]) for r in rows if r and r[0] is not None]
            return users
        except (OperationalError, ProgrammingError):
            return []

    # ----------------------------
    # 읽기: 인기상품(판매량 -> 최신)
    # ----------------------------
    def _get_popular_products(self, limit: int, days: int) -> List[ProductScore]:
        """
        판매량 기반 인기상품 TOP.
        - et_order_item + et_product_sku + et_order + et_product 조인
        - 조인/컬럼이 없거나 주문 데이터가 없으면 최신 상품으로 fallback
        """
        limit = _clamp_limit(limit)
        days = _clamp_days(days)

        # 1) 판매량 기반
        try:
            with connection.cursor() as c:
                c.execute(
                    """
                    SELECT ps.product_id,
                           SUM(COALESCE(oi.quantity, 1)) AS sold_qty
                    FROM et_order_item oi
                    JOIN et_product_sku ps ON ps.sku_id = oi.sku_id
                    JOIN et_order o ON o.order_id = oi.order_id
                    JOIN et_product p ON p.product_id = ps.product_id
                    WHERE p.deleted_at IS NULL
                      AND o.deleted_at IS NULL
                      AND o.ordered_at >= (NOW() - INTERVAL %s DAY)
                    GROUP BY ps.product_id
                    ORDER BY sold_qty DESC, ps.product_id DESC
                    LIMIT %s
                    """,
                    [days, limit],
                )
                rows = c.fetchall()

            if rows:
                return [ProductScore(product_id=int(pid), score=float(qty or 0.0)) for (pid, qty) in rows]
        except (OperationalError, ProgrammingError):
            pass

        # 2) 최신 상품 fallback
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

            return [ProductScore(product_id=int(pid), score=0.0) for (pid,) in rows]
        except (OperationalError, ProgrammingError):
            return []

    # ----------------------------
    # 추천 생성 로직(현재는 임시: 인기상품 기반)
    # ----------------------------
    def _build_recos_for_user(self, user_id: int, popular: List[ProductScore], limit: int) -> List[Tuple[int, int, int, float]]:
        """
        return: (user_id, product_id, rank_no, score) 리스트
        """
        limit = _clamp_limit(limit)
        recos: List[Tuple[int, int, int, float]] = []

        rank = 1
        for ps in popular:
            recos.append((int(user_id), int(ps.product_id), rank, float(ps.score)))
            rank += 1
            if rank > limit:
                break

        return recos

    # ----------------------------
    # 쓰기: 추천 테이블 갱신
    # ----------------------------
    def _truncate_recommendation_table(self) -> None:
        with connection.cursor() as c:
            c.execute("TRUNCATE TABLE et_user_recommendation")
        self.stdout.write("[INFO] TRUNCATE et_user_recommendation done")

    def _write_user_recos(self, user_id: int, recos: List[Tuple[int, int, int, float]]) -> None:
        """
        user_id 단위로 기존 추천 삭제 후 재삽입
        """
        with transaction.atomic():
            with connection.cursor() as c:
                c.execute("DELETE FROM et_user_recommendation WHERE user_id = %s", [int(user_id)])

                if not recos:
                    return

                c.executemany(
                    """
                    INSERT INTO et_user_recommendation (user_id, product_id, rank_no, score)
                    VALUES (%s, %s, %s, %s)
                    """,
                    recos,
                )

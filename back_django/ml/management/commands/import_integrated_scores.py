from __future__ import annotations

import csv
from heapq import heappush, heapreplace
from pathlib import Path
from typing import Optional

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection, transaction


def _clamp(n: int, lo: int, hi: int) -> int:
    try:
        v = int(n)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(v, hi))


class Command(BaseCommand):
    """
    integrated_score_v2.csv(user_id, product_id, total_score) 기반으로
    et_user_recommendation(user_id, product_id, rank_no, score)를 생성합니다.

    - et_user_reco_stage를 사용하지 않습니다.
    - FK 정합성을 위해 et_user / et_product에 존재하는 것만 반영합니다.
    - CSV는 (user_id, product_id)당 1행(이미 집계됨)이라고 가정합니다.
    """

    help = "Build et_user_recommendation from integrated_score_v2.csv (Top-N per user), WITHOUT stage."

    def add_arguments(self, parser):
        parser.add_argument(
            "--path",
            type=str,
            default=str(getattr(settings, "INTEGRATED_SCORE_CSV_PATH")),
            help="CSV path (columns: user_id, product_id, total_score)",
        )
        parser.add_argument("--limit", type=int, default=5, help="recommendations per user (1~50)")
        parser.add_argument("--truncate", action="store_true", help="TRUNCATE et_user_recommendation before insert")

        parser.add_argument("--user-id", type=int, default=None, help="build only one user_id (optional)")
        parser.add_argument("--user-max", type=int, default=None, help="only users with user_id <= user-max")
        parser.add_argument("--user-limit", type=int, default=None, help="limit number of target users (e.g., 100)")

        parser.add_argument(
            "--seed-dummy-users",
            action="store_true",
            help="ONLY when et_user is empty: create dummy users for selected targets (from CSV).",
        )

    def handle(self, *args, **opts):
        csv_path = Path(opts["path"])
        limit = _clamp(opts.get("limit", 5), 1, 50)
        truncate = bool(opts.get("truncate"))

        user_id: Optional[int] = opts.get("user_id")
        user_max: Optional[int] = opts.get("user_max")
        user_limit: Optional[int] = opts.get("user_limit")
        seed_dummy_users: bool = bool(opts.get("seed_dummy_users"))

        self.stdout.write(
            f"[import_integrated_scores] path={csv_path} limit={limit} truncate={truncate} "
            f"user_id={user_id} user_max={user_max} user_limit={user_limit} seed_dummy_users={seed_dummy_users}"
        )

        if not csv_path.exists():
            raise RuntimeError(f"CSV 파일이 없습니다: {csv_path}")

        prod_cnt = self._scalar("SELECT COUNT(*) FROM et_product")
        user_cnt = self._scalar("SELECT COUNT(*) FROM et_user")
        self.stdout.write(f"[CHECK] et_product_rows={prod_cnt} et_user_rows={user_cnt}")

        if prod_cnt <= 0:
            raise RuntimeError("et_product가 비어있습니다. 팀 상품 SQL 실행이 먼저입니다.")

        # et_user가 비어있으면(팀 SQL에 유저가 없을 때) 옵션으로 더미 유저 생성 가능
        if user_cnt <= 0 and not seed_dummy_users:
            raise RuntimeError("et_user가 0건입니다. 로컬 검증이면 --seed-dummy-users를 사용하세요.")

        valid_products = self._fetch_id_set("SELECT product_id FROM et_product")
        valid_users = self._fetch_id_set("SELECT user_id FROM et_user") if user_cnt > 0 else set()

        # user filters 준비
        def _user_ok(u: int) -> bool:
            if user_id is not None and u != int(user_id):
                return False
            if user_max is not None and u > int(user_max):
                return False
            return True

        # 1) CSV에서 Top-N만 유지(메모리 폭발 방지)
        # 힙의 "가장 나쁜 항목"을 루트로 만들기 위해 (score ASC, product_id DESC)를 worst로 둡니다.
        # key = (score, -product_id, product_id)
        topn: dict[int, list[tuple[float, int, int]]] = {}
        seen_users_order: list[int] = []  # user_limit 용

        with csv_path.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            need = {"user_id", "product_id", "total_score"}
            if set(reader.fieldnames or []) < need:
                raise RuntimeError(f"CSV 컬럼이 부족합니다. 필요={sorted(need)} / 실제={reader.fieldnames}")

            for row in reader:
                u = int(row["user_id"])
                if not _user_ok(u):
                    continue

                # user_limit: 처음 등장한 유저 기준으로 제한
                if user_limit is not None:
                    if u not in topn:
                        if len(seen_users_order) >= int(user_limit):
                            continue
                        seen_users_order.append(u)

                p = int(row["product_id"])
                s = float(row["total_score"])

                # product 정합성
                if p not in valid_products:
                    continue

                # et_user가 이미 있다면 user 정합성 필터
                if valid_users and u not in valid_users:
                    continue

                heap = topn.get(u)
                item = (s, -p, p)

                if heap is None:
                    topn[u] = [item]
                    continue

                if len(heap) < limit:
                    heappush(heap, item)
                else:
                    # heap[0]이 현재 worst인데, 새 item이 더 좋으면 교체
                    if item > heap[0]:
                        heapreplace(heap, item)

        if not topn:
            raise RuntimeError("CSV에서 반영할 데이터가 없습니다. (필터/정합성/경로 확인 필요)")

        # 2) 더미 유저 생성(필요 시) - CSV에 등장한 유저만
        if user_cnt <= 0 and seed_dummy_users:
            target_users = sorted(topn.keys())
            if user_limit is not None:
                target_users = seen_users_order[:]  # 등장 순서 기준 제한
            self._seed_dummy_users(target_users)
            valid_users = self._fetch_id_set("SELECT user_id FROM et_user")
            self.stdout.write(f"[INFO] seeded dummy users. et_user_rows={len(valid_users)}")

        # 3) 삽입 데이터 구성 (rank_no는 score desc, product_id asc 기준으로 1..N)
        recos: list[tuple[int, int, int, float]] = []
        target_user_ids = sorted(topn.keys())

        for u in target_user_ids:
            items = topn[u]
            items_sorted = sorted(items, key=lambda x: (-x[0], x[2]))  # score desc, product_id asc
            for idx, (score, _neg_p, p) in enumerate(items_sorted, start=1):
                recos.append((u, p, idx, float(score)))

        # 4) DB 반영
        with transaction.atomic():
            if truncate:
                self._exec("TRUNCATE TABLE et_user_recommendation")
                self.stdout.write("[INFO] TRUNCATE et_user_recommendation done")
            else:
                # 타겟 유저만 삭제
                self._delete_users(sorted({u for (u, _, _, _) in recos}))
                self.stdout.write("[INFO] DELETE existing recommendations for targets done")

            self._bulk_insert(recos)

        self.stdout.write(self.style.SUCCESS(f"[DONE] inserted_rows={len(recos)} users={len(set(u for u,_,_,_ in recos))}"))

    # -----------------------
    # 내부 유틸
    # -----------------------
    def _scalar(self, sql: str, params=None) -> int:
        with connection.cursor() as c:
            c.execute(sql, params or [])
            row = c.fetchone()
        return int(row[0] or 0)

    def _exec(self, sql: str, params=None) -> None:
        with connection.cursor() as c:
            c.execute(sql, params or [])

    def _fetch_id_set(self, sql: str) -> set[int]:
        with connection.cursor() as c:
            c.execute(sql)
            return {int(r[0]) for r in c.fetchall()}

    def _delete_users(self, user_ids: list[int]) -> None:
        if not user_ids:
            return
        placeholders = ",".join(["%s"] * len(user_ids))
        sql = f"DELETE FROM et_user_recommendation WHERE user_id IN ({placeholders})"
        self._exec(sql, user_ids)

    def _bulk_insert(self, recos: list[tuple[int, int, int, float]]) -> None:
        sql = """
            INSERT INTO et_user_recommendation (user_id, product_id, rank_no, score)
            VALUES (%s, %s, %s, %s)
        """
        with connection.cursor() as c:
            c.executemany(sql, recos)

    def _seed_dummy_users(self, user_ids: list[int]) -> None:
        # DDL 기준: et_user는 email/password NOT NULL, status는 DEFAULT('ACTIVE')가 있으므로 생략 가능
        placeholders = ",".join(["%s"] * len(user_ids))
        sql = f"""
            INSERT IGNORE INTO et_user (user_id, email, password)
            SELECT x.user_id,
                   CONCAT('u', x.user_id, '@dummy.local') AS email,
                   SHA2(CONCAT('pw', x.user_id), 256)     AS password
            FROM (
                SELECT CAST(t AS SIGNED) AS user_id
                FROM (SELECT {placeholders}) v(t)
            ) x
        """
        # MySQL에서 VALUES 테이블을 이렇게 쓰는 게 환경에 따라 막힐 수 있어,
        # 안전하게 Python executemany로 처리합니다.
        with connection.cursor() as c:
            c.executemany(
                "INSERT IGNORE INTO et_user (user_id, email, password) VALUES (%s, %s, %s)",
                [(u, f"u{u}@dummy.local", "") for u in user_ids],
            )
            # password 빈값이면 NOT NULL 제약에 걸릴 수 있으니 SHA2로 넣습니다.
            c.executemany(
                "UPDATE et_user SET password = SHA2(CONCAT('pw', user_id), 256) WHERE password = '' AND user_id = %s",
                [(u,) for u in user_ids],
            )

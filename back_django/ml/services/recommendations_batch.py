# ml/services/recommendations_batch.py

from __future__ import annotations

from pathlib import Path

import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from django.db import connection, transaction


def _clamp_int(v: int, lo: int, hi: int) -> int:
    try:
        n = int(v)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(n, hi))


def _fetch_id_set(sql: str) -> set[int]:
    with connection.cursor() as c:
        c.execute(sql)
        return {int(r[0]) for r in c.fetchall()}


def rebuild_usercf_recommendations_from_csv(
    csv_path: Path,
    top_n: int = 5,
    similar_k: int = 10,
    truncate: bool = True,
) -> int:
    """
    CSV(user_id, product_id, final_preference) 기반으로 유저-유저 코사인 유사도 추천 생성 후
    et_user_recommendation(user_id, product_id, rank_no, score)에 저장합니다.

    - recommendation_id: AUTO_INCREMENT라 insert에서 제외
    - created_at: DEFAULT CURRENT_TIMESTAMP라 insert에서 제외
    """
    top_n = _clamp_int(top_n, 1, 50)
    similar_k = _clamp_int(similar_k, 1, 50)

    if not csv_path.exists():
        raise RuntimeError(f"CSV 파일이 없습니다: {csv_path}")

    df = pd.read_csv(csv_path)
    need = {"user_id", "product_id", "final_preference"}
    if not need.issubset(df.columns):
        raise RuntimeError(f"CSV 컬럼이 부족합니다. 필요={sorted(need)} / 실제={list(df.columns)}")

    valid_users = _fetch_id_set("SELECT user_id FROM et_user")
    valid_products = _fetch_id_set("SELECT product_id FROM et_product")
    if not valid_users:
        raise RuntimeError("et_user가 비어있습니다. 팀 유저 SQL이 먼저입니다.")
    if not valid_products:
        raise RuntimeError("et_product가 비어있습니다. 팀 상품 SQL이 먼저입니다.")

    # FK 정합성 필터
    df = df[df["user_id"].isin(valid_users) & df["product_id"].isin(valid_products)]
    if df.empty:
        raise RuntimeError("CSV 데이터가 DB의 유효 user/product와 매칭되지 않아 비었습니다.")

    # 유저-상품 행렬
    user_item = (
        df.pivot_table(
            index="user_id",
            columns="product_id",
            values="final_preference",
            aggfunc="mean",
        )
        .fillna(0.0)
    )

    if user_item.shape[0] < 2:
        raise RuntimeError("유저 수가 2명 미만이라 유사도 계산이 불가합니다.")

    # 유사도
    sim = cosine_similarity(user_item.values)
    user_ids = user_item.index.to_list()
    sim_df = pd.DataFrame(sim, index=user_ids, columns=user_ids)

    # 추천 제외(이미 상호작용한 상품)
    purchased_map = df.groupby("user_id")["product_id"].apply(lambda x: set(map(int, x))).to_dict()

    recos: list[tuple[int, int, int, float]] = []

    for u in user_ids:
        sims = sim_df[u].drop(index=u).sort_values(ascending=False).head(similar_k)
        if float(sims.sum()) == 0.0:
            continue

        sim_users = sims.index.to_list()
        weights = sims.values.reshape(-1, 1)
        sim_data = user_item.loc[sim_users]

        weighted_scores = (sim_data * weights).sum(axis=0) / (weights.sum() + 1e-9)

        purchased = purchased_map.get(int(u), set())
        if purchased:
            weighted_scores = weighted_scores.drop(labels=list(purchased), errors="ignore")

        top = weighted_scores.sort_values(ascending=False).head(top_n)

        for rank_no, (product_id, score) in enumerate(top.items(), start=1):
            recos.append((int(u), int(product_id), int(rank_no), float(round(float(score), 4))))

    if not recos:
        return 0

    with transaction.atomic():
        with connection.cursor() as c:
            if truncate:
                c.execute("SET FOREIGN_KEY_CHECKS = 0;")
                c.execute("TRUNCATE TABLE et_user_recommendation;")
                c.execute("SET FOREIGN_KEY_CHECKS = 1;")
            else:
                target_users = sorted({u for (u, _, _, _) in recos})
                placeholders = ",".join(["%s"] * len(target_users))
                c.execute(
                    f"DELETE FROM et_user_recommendation WHERE user_id IN ({placeholders})",
                    target_users,
                )

            c.executemany(
                """
                INSERT INTO et_user_recommendation (user_id, product_id, rank_no, score)
                VALUES (%s, %s, %s, %s)
                """,
                recos,
            )

    return len(recos)

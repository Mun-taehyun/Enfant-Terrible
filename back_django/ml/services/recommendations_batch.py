from __future__ import annotations
from pathlib import Path
import pandas as pd
import numpy as np
import random
from sklearn.metrics.pairwise import cosine_similarity
from django.db import connection, transaction

# [개인화 설정] 랜덤 시드 1 고정 (재현성 확보)
np.random.seed(1)
random.seed(1)

def _clamp_int(v: int, lo: int, hi: int) -> int:
    try:
        n = int(v)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(n, hi))

def _fetch_id_set(sql: str) -> set[int]:
    with connection.cursor() as c:
        c.execute(sql)
        # BIGINT 대응을 위해 확실하게 int로 변환
        return {int(r[0]) for r in c.fetchall()}

def rebuild_usercf_recommendations_from_csv(
    csv_path: Path,
    top_n: int = 5,
    similar_k: int = 10,
    truncate: bool = True,
) -> int:
    """
    CSV 기반 유저 유사도 추천 생성 후 et_user_recommendation 테이블에 저장.
    """
    top_n = _clamp_int(top_n, 1, 50)
    similar_k = _clamp_int(similar_k, 1, 50)

    if not csv_path.exists():
        raise RuntimeError(f"❌ CSV 파일이 없습니다: {csv_path}")

    # 데이터 로드
    df = pd.read_csv(csv_path)
    need = {"user_id", "product_id", "final_preference"}
    if not need.issubset(df.columns):
        raise RuntimeError(f"❌ CSV 컬럼 부족: 필요={sorted(need)}")

    # DB의 유효한 ID와 대조 (FK 제약 위반 방지)
    valid_users = _fetch_id_set("SELECT user_id FROM et_user WHERE status='ACTIVE'")
    valid_products = _fetch_id_set("SELECT product_id FROM et_product WHERE deleted_at IS NULL")
    
    if not valid_users or not valid_products:
        raise RuntimeError("❌ DB에 유효한 유저 또는 상품 데이터가 없습니다. 마이그레이션을 먼저 진행하세요.")

    # 필터링
    df = df[df["user_id"].isin(valid_users) & df["product_id"].isin(valid_products)]
    if df.empty:
        raise RuntimeError("❌ 매칭되는 데이터가 없어 추천을 생성할 수 없습니다.")

    # 1. 유저-상품 행렬 생성
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
        return 0 # 유사도 계산 불가

    # 2. 코사인 유사도 계산
    sim = cosine_similarity(user_item.values)
    user_ids = user_item.index.to_list()
    sim_df = pd.DataFrame(sim, index=user_ids, columns=user_ids)

    # 이미 구매/상호작용한 상품 맵
    purchased_map = df.groupby("user_id")["product_id"].apply(lambda x: set(map(int, x))).to_dict()

    recos: list[tuple[int, int, int, float]] = []

    # 3. 유저별 추천 루프
    for u in user_ids:
        # 유사한 유저 k명 추출
        sims = sim_df[u].drop(index=u).sort_values(ascending=False).head(similar_k)
        if float(sims.sum()) == 0.0:
            continue

        sim_users = sims.index.to_list()
        weights = sims.values.reshape(-1, 1)
        sim_data = user_item.loc[sim_users]

        # 가중 평균 점수 계산
        weighted_scores = (sim_data * weights).sum(axis=0) / (weights.sum() + 1e-9)

        # 이미 상호작용한 상품 제외
        purchased = purchased_map.get(int(u), set())
        weighted_scores = weighted_scores.drop(labels=list(purchased), errors="ignore")

        # 상위 n개 선정
        top = weighted_scores.sort_values(ascending=False).head(top_n)

        for rank_no, (product_id, score) in enumerate(top.items(), start=1):
            if score > 0: # 점수가 0보다 큰 경우만 추천
                recos.append((
                    int(u), 
                    int(product_id), 
                    int(rank_no), 
                    float(round(float(score), 4))
                ))

    # 4. DB 반영
    if not recos:
        print("⚠️ 생성된 추천 데이터가 없습니다.")
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

            # 대량 삽입
            c.executemany(
                """
                INSERT INTO et_user_recommendation (user_id, product_id, rank_no, score)
                VALUES (%s, %s, %s, %s)
                """,
                recos,
            )

    print(f"✅ [User: kosmo] 추천 엔진 가동 완료: {len(recos)}건 저장됨.")
    return len(recos)
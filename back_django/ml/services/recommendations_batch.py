from __future__ import annotations
from pathlib import Path
import pandas as pd
import numpy as np
import random
from datetime import datetime
from sklearn.metrics.pairwise import cosine_similarity
from django.db import connection, transaction

# [개인화 설정] 랜덤 시드 1 고정 및 명칭 kosmo 통일
np.random.seed(1)
random.seed(1)
USER_NAME = "kosmo"

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
    top_n: int = 10,
    similar_k: int = 20,
    truncate: bool = True,
) -> int:
    """
    구매 이력 기반 유저 유사도 추천 생성 및 kosmo DB 저장
    """
    top_n = _clamp_int(top_n, 1, 50)
    similar_k = _clamp_int(similar_k, 1, 50)
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    if not csv_path.exists():
        raise RuntimeError(f"❌ CSV 파일이 없습니다: {csv_path}")

    # 1. 데이터 로드
    df = pd.read_csv(csv_path)
    
    # [수정] purchase_history.csv에는 final_preference가 없을 수 있으므로 점수 부여 로직 추가
    if "final_preference" not in df.columns:
        # 구매 횟수 등을 기반으로 임시 점수(5.0점) 부여
        df["final_preference"] = 5.0

    # 2. 유효성 검사 (kosmo DB 스키마 기준)
    # Django connection을 통해 실제 DB의 유저와 상품이 존재하는지 체크
    valid_users = _fetch_id_set("SELECT user_id FROM et_user WHERE deleted_at IS NULL")
    valid_products = _fetch_id_set("SELECT product_id FROM et_product WHERE deleted_at IS NULL")
    
    df = df[df["user_id"].isin(valid_users) & df["product_id"].isin(valid_products)]
    if df.empty:
        print(f"⚠️ [{USER_NAME}] 유효한 매칭 데이터가 없어 추천 생성을 중단합니다.")
        return 0

    # 3. 유저-상품 피벗 테이블 생성
    user_item = df.pivot_table(
        index="user_id",
        columns="product_id",
        values="final_preference",
        aggfunc="sum", # 여러 번 구매했다면 점수를 합산
    ).fillna(0.0)

    if user_item.shape[0] < 2:
        print(f"⚠️ [{USER_NAME}] 유사도 계산을 위한 유저 수가 부족합니다.")
        return 0 

    # 4. 코사인 유사도 계산
    sim = cosine_similarity(user_item.values)
    user_ids = user_item.index.to_list()
    sim_df = pd.DataFrame(sim, index=user_ids, columns=user_ids)

    # 중복 추천 방지용 맵
    purchased_map = df.groupby("user_id")["product_id"].apply(lambda x: set(map(int, x))).to_dict()

    recos: list[tuple] = []

    # 5. 유저별 맞춤 상품 계산
    for u in user_ids:
        sims = sim_df[u].drop(index=u).sort_values(ascending=False).head(similar_k)
        if float(sims.sum()) == 0.0:
            continue

        sim_users = sims.index.to_list()
        weights = sims.values.reshape(-1, 1)
        sim_data = user_item.loc[sim_users]

        # 가중 평균 점수 계산
        weighted_scores = (sim_data * weights).sum(axis=0) / (weights.sum() + 1e-9)

        # 본인이 이미 산 장난감/사료는 제외
        purchased = purchased_map.get(int(u), set())
        weighted_scores = weighted_scores.drop(labels=list(purchased), errors="ignore")

        # 상위 n개 선정
        top = weighted_scores.sort_values(ascending=False).head(top_n)

        for rank_no, (product_id, score) in enumerate(top.items(), start=1):
            if score >= 0.1: # 최소 유효 점수
                recos.append((
                    int(u), 
                    int(product_id), 
                    int(rank_no), 
                    float(round(float(score), 2)),
                    current_time 
                ))

    # 6. kosmo DB 트랜잭션 저장
    if not recos:
        return 0

    try:
        with transaction.atomic():
            with connection.cursor() as c:
                c.execute("SET FOREIGN_KEY_CHECKS = 0;")
                
                if truncate:
                    c.execute("TRUNCATE TABLE et_user_recommendation;")
                
                # Bulk Insert
                c.executemany(
                    """
                    INSERT INTO et_user_recommendation (user_id, product_id, rank_no, score, created_at)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    recos,
                )
                c.execute("SET FOREIGN_KEY_CHECKS = 1;")
                
        print(f"✅ [{USER_NAME}] 추천 엔진 가동 완료: {len(recos)}건의 맞춤 상품(사료/장난감 등) 저장됨.")
        return len(recos)

    except Exception as e:
        print(f"❌ [{USER_NAME}] DB 저장 중 오류 발생: {e}")
        return 0
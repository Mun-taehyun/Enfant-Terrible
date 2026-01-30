from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.metrics.pairwise import cosine_similarity
from django.db import connection, transaction

# [개인화 설정] 랜덤 시드 고정
np.random.seed(1)

def _fetch_id_set(sql: str) -> set[int]:
    """DB에서 유효한 ID 목록을 가져옴"""
    with connection.cursor() as c:
        c.execute(sql)
        return {int(r[0]) for r in c.fetchall()}

def rebuild_usercf_recommendations(
    csv_path: Path,
    top_n: int = 10,
    similar_k: int = 20
) -> int:
    """구매 이력(CSV) 기반 유저 유사도 추천 생성 및 DB 저장"""
    if not csv_path.exists():
        print(f"❌ CSV 파일이 없습니다: {csv_path}")
        return 0

    # 1. 데이터 로드 및 점수 부여
    df = pd.read_csv(csv_path)
    if "final_preference" not in df.columns:
        df["final_preference"] = 5.0  # 기본 점수 부여

    # 2. 유효성 검사 (실제 DB에 존재하는 유저/상품만 필터링)
    valid_users = _fetch_id_set("SELECT user_id FROM et_user WHERE deleted_at IS NULL")
    valid_products = _fetch_id_set("SELECT product_id FROM et_product WHERE deleted_at IS NULL")
    
    df = df[df["user_id"].isin(valid_users) & df["product_id"].isin(valid_products)]
    if df.empty: return 0

    # 3. 유저-상품 피벗 테이블 및 유사도 계산
    user_item = df.pivot_table(
        index="user_id", columns="product_id", values="final_preference", aggfunc="sum"
    ).fillna(0.0)

    if user_item.shape[0] < 2: return 0 

    sim = cosine_similarity(user_item.values)
    sim_df = pd.DataFrame(sim, index=user_item.index, columns=user_item.index)
    purchased_map = df.groupby("user_id")["product_id"].apply(lambda x: set(map(int, x))).to_dict()

    # 4. 유저별 맞춤 추천 리스트 생성
    recos = []
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    for u in user_item.index:
        # 유사 유저 상위 K명 추출
        sims = sim_df[u].drop(index=u).sort_values(ascending=False).head(similar_k)
        if sims.sum() == 0: continue

        # 가중 평균 점수 계산 (본인 구매 제외)
        weights = sims.values.reshape(-1, 1)
        weighted_scores = (user_item.loc[sims.index] * weights).sum() / (weights.sum() + 1e-9)
        
        purchased = purchased_map.get(int(u), set())
        weighted_scores = weighted_scores.drop(labels=list(purchased), errors="ignore")

        # 상위 N개 추출
        top = weighted_scores.sort_values(ascending=False).head(top_n)
        for rank_no, (product_id, score) in enumerate(top.items(), start=1):
            if score >= 0.1:
                recos.append((int(u), int(product_id), int(rank_no), round(float(score), 2), current_time))

    # 5. DB 트랜잭션 저장 (Truncate & Insert)
    if not recos: return 0

    try:
        with transaction.atomic():
            with connection.cursor() as c:
                c.execute("SET FOREIGN_KEY_CHECKS = 0;")
                c.execute("TRUNCATE TABLE et_user_recommendation;")
                c.executemany(
                    "INSERT INTO et_user_recommendation (user_id, product_id, rank_no, score, created_at) VALUES (%s, %s, %s, %s, %s)",
                    recos
                )
                c.execute("SET FOREIGN_KEY_CHECKS = 1;")
        print(f"✅ 추천 엔진 가동 완료: {len(recos)}건 저장됨.")
        return len(recos)
    except Exception as e:
        print(f"❌ DB 저장 중 오류: {e}")
        return 0
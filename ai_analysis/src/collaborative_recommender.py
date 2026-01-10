#collavorative_recommender.py
# 추천 계산한다

import os
import time
from pathlib import Path

import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text


def _clamp(n: int, lo: int, hi: int) -> int:
    try:
        v = int(n)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(v, hi))


def run_full_batch_recommendation_erd(top_n=5, similar_k=10, truncate=True):
    # 1) DB URL: 환경변수 키 통일
    db_url = os.getenv("ENFANT_TERRIBLE_URL")
    if not db_url:
        raise RuntimeError("ENFANT_TERRIBLE_URL 환경변수가 없습니다.")
    engine = create_engine(db_url, pool_pre_ping=True)

    top_n = _clamp(top_n, 1, 50)
    similar_k = _clamp(similar_k, 1, 50)

    # 2) CSV 경로: SERVICE_READY_CSV로 통일 (없으면 로컬 기본)
    out_path = os.getenv("SERVICE_READY_CSV")
    if out_path:
        file_path = Path(out_path).resolve()
    else:
        current_file_path = Path(__file__).resolve()
        base_dir = current_file_path.parent.parent
        file_path = base_dir / "data" / "processed" / "service_ready_data.csv"

    if not file_path.exists():
        raise RuntimeError(f"service_ready_data.csv 파일이 없습니다: {file_path}")

    start_time = time.time()
    print(f"[batch] input={file_path} top_n={top_n} similar_k={similar_k} truncate={truncate}")

    # 3) 읽기
    df_scores = pd.read_csv(file_path)

    need = {"user_id", "product_id", "final_preference"}
    if not need.issubset(df_scores.columns):
        raise RuntimeError(f"CSV 컬럼이 부족합니다. 필요={sorted(need)} 실제={list(df_scores.columns)}")

    # 4) user-item matrix / cosine
    user_item_matrix = (
        df_scores.pivot_table(index="user_id", columns="product_id", values="final_preference")
        .fillna(0)
    )

    user_sim = cosine_similarity(user_item_matrix)
    user_sim_df = pd.DataFrame(user_sim, index=user_item_matrix.index, columns=user_item_matrix.index)

    # 5) 추천 생성
    all_rows = []
    for target_user_id in user_item_matrix.index:
        similar_users = user_sim_df[target_user_id].sort_values(ascending=False)[1: 1 + similar_k]
        if float(similar_users.sum()) == 0.0:
            continue

        sim_user_data = user_item_matrix.loc[similar_users.index]
        weights = similar_users.values.reshape(-1, 1)
        weighted_scores = (sim_user_data * weights).sum(axis=0) / (weights.sum() + 1e-9)

        purchased = df_scores[df_scores["user_id"] == target_user_id]["product_id"].unique()
        recs = weighted_scores.drop(purchased, errors="ignore").sort_values(ascending=False).head(top_n)

        for r_idx, (p_id, score) in enumerate(recs.items(), 1):
            all_rows.append({
                "user_id": int(target_user_id),
                "product_id": int(p_id),
                "rank_no": int(r_idx),          # 테이블 컬럼명과 일치
                "score": float(round(score, 4)) # 테이블 컬럼명과 일치
                # created_at은 DEFAULT가 있으니 굳이 넣지 않음
            })

    if not all_rows:
        print("[batch] 생성된 추천 데이터가 없습니다.")
        return 0

    # 6) DB 반영
    with engine.begin() as conn:
        if truncate:
            conn.execute(text("TRUNCATE TABLE et_user_recommendation"))

        # executemany insert
        conn.execute(
            text("""
                INSERT INTO et_user_recommendation (user_id, product_id, rank_no, score)
                VALUES (:user_id, :product_id, :rank_no, :score)
            """),
            all_rows
        )

    print(f"[batch] inserted_rows={len(all_rows)} elapsed={time.time() - start_time:.2f}s")
    return len(all_rows)


if __name__ == "__main__":
    run_full_batch_recommendation_erd()

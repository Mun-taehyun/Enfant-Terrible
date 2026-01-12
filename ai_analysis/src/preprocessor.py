#preprocessor
# 전처리 핵심 파일
import os
import time
from pathlib import Path
from dotenv import load_dotenv

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, ProgrammingError

load_dotenv()


def _must_env(name: str) -> str:
    v = os.getenv(name)
    if not v or not v.strip():
        raise RuntimeError(f"환경변수 {name} 가 설정되어 있지 않습니다.")
    return v.strip()


def _is_strict_mode() -> bool:
    env = (os.getenv("ENV") or "").strip().lower()
    return env in ("prod", "production")


STRICT = _is_strict_mode()
RATING_WEIGHT = float(os.getenv("RATING_WEIGHT", "2") or "2")

# DB URL: 반드시 환경변수로 통일
DB_URL = _must_env("ENFANT_TERRIBLE_URL")
engine = create_engine(DB_URL, pool_pre_ping=True)

# PATH
current_file_path = Path(__file__).resolve()
base_dir = current_file_path.parent.parent  # ai_analysis 기준
processed_dir = base_dir / "data" / "processed"
processed_dir.mkdir(parents=True, exist_ok=True)

out_path = os.getenv("SERVICE_READY_CSV")
if out_path:
    output_file = Path(out_path).resolve()
    output_file.parent.mkdir(parents=True, exist_ok=True)
else:
    output_file = processed_dir / "service_ready_data.csv"


def _has_table(conn, table: str) -> bool:
    row = conn.execute(
        text(
            """
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
              AND table_name = :t
            LIMIT 1
            """
        ),
        {"t": table},
    ).first()
    return row is not None


def _read_sql_safe(conn, sql: str, empty_cols=None) -> pd.DataFrame:
    try:
        return pd.read_sql(sql, conn)
    except (OperationalError, ProgrammingError):
        if empty_cols is None:
            return pd.DataFrame()
        return pd.DataFrame(columns=empty_cols)

#가장 중요한 부분

def preprocess_for_real_service():
    start_time = time.time()

    print(f"[preprocess] strict={STRICT} rating_weight={RATING_WEIGHT}")
    print(f"[preprocess] output={output_file}")

    with engine.connect() as conn:
        # 필수 테이블 체크(덤프 기준)
        required_tables = [
            "et_order",
            "et_order_item",
            "et_product_sku",
            "et_product",
            "et_user",
            "et_product_review",
        ]
        missing = [t for t in required_tables if not _has_table(conn, t)]
        if missing:
            raise RuntimeError(f"필수 테이블이 없습니다: {missing}")

        # 1) 주문 기반 score (sku → product)
        df_order = _read_sql_safe(
            conn,
            """
            SELECT
                o.user_id,
                ps.product_id,
                SUM(COALESCE(oi.quantity, 1)) AS score
            FROM et_order_item oi
            JOIN et_order o ON o.order_id = oi.order_id
            JOIN et_product_sku ps ON ps.sku_id = oi.sku_id
            JOIN et_product p ON p.product_id = ps.product_id
            WHERE o.deleted_at IS NULL
              AND p.deleted_at IS NULL
            GROUP BY o.user_id, ps.product_id
            """,
            empty_cols=["user_id", "product_id", "score"],
        )

        if df_order.empty:
            # 운영 기준: 주문 데이터가 없으면 전처리 불가로 보는 게 안전합니다.
            raise RuntimeError("주문 기반 점수(df_order)가 0건입니다. 운영 전처리 불가입니다.")

        # 2) 리뷰 rating (없으면 0 처리)
        df_review = _read_sql_safe(
            conn,
            """
            SELECT user_id, product_id, rating
            FROM et_product_review
            WHERE deleted_at IS NULL
            """,
            empty_cols=["user_id", "product_id", "rating"],
        )

    # 3) 최종 선호도
    final_df = pd.merge(df_order, df_review, on=["user_id", "product_id"], how="left")
    final_df["rating"] = final_df["rating"].fillna(0)
    final_df["final_preference"] = final_df["score"].fillna(0) + (final_df["rating"] * RATING_WEIGHT)

    # 4) 출력
    final_df[["user_id", "product_id", "final_preference"]].to_csv(
        output_file, index=False, encoding="utf-8-sig"
    )

    print(f"[preprocess] wrote: {output_file}")
    print(f"[preprocess] rows={len(final_df)} elapsed={time.time() - start_time:.2f}s")


if __name__ == "__main__":
    preprocess_for_real_service()

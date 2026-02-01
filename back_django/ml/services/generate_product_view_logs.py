import os
import sys
import csv
import argparse
import random
from datetime import datetime, date, time, timedelta
from pathlib import Path

current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django

django.setup()

from django.conf import settings
from django.db import connection


DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML like Gecko) "
    "Chrome/144.0.0.0 Safari/537.36"
)


def _load_ids() -> tuple[list[int], list[int]]:
    with connection.cursor() as c:
        c.execute("SELECT product_id FROM et_product ORDER BY product_id")
        product_ids = [int(r[0]) for r in c.fetchall()]

        c.execute("SELECT user_id FROM et_user ORDER BY user_id")
        user_ids = [int(r[0]) for r in c.fetchall()]

    return product_ids, user_ids


def _rand_session_id() -> str:
    # 짧고 단순한 세션 ID
    alphabet = "0123456789abcdef"
    return "".join(random.choice(alphabet) for _ in range(32))


def _rand_ip() -> str:
    # 로컬/사설/루프백 위주로 섞음
    choices = [
        "0:0:0:0:0:0:0:1",
        "127.0.0.1",
        "192.168.0.%d" % random.randint(2, 254),
        "10.0.0.%d" % random.randint(2, 254),
    ]
    return random.choice(choices)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--start-date", type=str, default=None, help="YYYY-MM-DD")
    ap.add_argument("--days", type=int, default=3)
    ap.add_argument("--per-day", type=int, default=10000)
    ap.add_argument("--logged-in-ratio", type=float, default=0.7)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    random.seed(int(args.seed))

    if args.start_date:
        start = date.fromisoformat(args.start_date)
    else:
        start = date.today() - timedelta(days=(int(args.days) - 1))

    days = int(args.days)
    per_day = int(args.per_day)
    logged_in_ratio = float(args.logged_in_ratio)

    product_ids, user_ids = _load_ids()
    if not product_ids:
        raise SystemExit("No products in et_product")

    log_dir = Path(settings.BASE_DIR).parent / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)

    header = ["timestamp", "productId", "userId", "sessionId", "clientIp", "userAgent"]

    for d in range(days):
        day = start + timedelta(days=d)
        out_path = log_dir / f"product_view_{day.isoformat()}.csv"

        start_dt = datetime.combine(day, time(0, 0, 0))
        end_dt = start_dt + timedelta(days=1)

        with out_path.open("w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(header)

            for _ in range(per_day):
                # 하루 구간 랜덤 타임스탬프
                delta = random.randint(0, int((end_dt - start_dt).total_seconds()) - 1)
                ts = start_dt + timedelta(seconds=delta)

                product_id = random.choice(product_ids)

                # 일부는 비회원(기존 로그에 userId/sessionId 공란도 있었음)
                if user_ids and random.random() < logged_in_ratio:
                    user_id = str(random.choice(user_ids))
                    session_id = _rand_session_id()
                else:
                    user_id = ""
                    session_id = "" if random.random() < 0.5 else _rand_session_id()

                client_ip = _rand_ip()
                user_agent = DEFAULT_USER_AGENT

                w.writerow([
                    ts.strftime("%Y-%m-%dT%H:%M:%S"),
                    product_id,
                    user_id,
                    session_id,
                    client_ip,
                    user_agent,
                ])

        print(f"wrote {out_path} rows={per_day}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

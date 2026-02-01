import os
import sys
import argparse
from pathlib import Path

current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django

django.setup()

from django.db import connection, transaction


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--start-id", type=int, default=1)
    ap.add_argument("--end-id", type=int, default=100)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    start_id = int(args.start_id)
    end_id = int(args.end_id)
    apply = bool(args.apply)

    with transaction.atomic():
        with connection.cursor() as c:
            c.execute(
                """
                UPDATE et_file
                SET ref_type = 'PRODUCT',
                    file_type = 'URL',
                    file_path = ''
                WHERE ref_id BETWEEN %s AND %s
                  AND file_role IN ('THUMBNAIL', 'CONTENT')
                  AND deleted_at IS NULL
                """,
                [start_id, end_id],
            )
            updated = int(c.rowcount)

        if not apply:
            transaction.set_rollback(True)

    print(f"updated_rows={updated} applied={apply}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

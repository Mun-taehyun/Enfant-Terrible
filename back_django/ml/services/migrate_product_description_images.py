import os
import sys
import re
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

TOKEN = "||IMG_URL||:"


def _extract_image_url(description: str) -> tuple[str, str] | tuple[None, None]:
    if description is None:
        return None, None

    idx = description.find(TOKEN)
    if idx < 0:
        return None, None

    before = description[:idx].rstrip()
    after = description[idx + len(TOKEN) :].strip()

    m = re.search(r"https?://\S+", after)
    if not m:
        return None, None

    url = m.group(0).rstrip("'\" ")
    return before, url


def _has_thumbnail(product_id: int) -> bool:
    with connection.cursor() as c:
        c.execute(
            """
            SELECT 1
            FROM et_file
            WHERE ref_type = 'product'
              AND ref_id = %s
              AND file_role = 'THUMBNAIL'
              AND deleted_at IS NULL
            LIMIT 1
            """,
            [product_id],
        )
        return c.fetchone() is not None


def _insert_thumbnail(product_id: int, url: str) -> None:
    with connection.cursor() as c:
        c.execute(
            """
            INSERT INTO et_file (
              ref_type,
              ref_id,
              file_url,
              file_role,
              original_name,
              stored_name,
              file_type,
              file_path
            ) VALUES (
              'product',
              %s,
              %s,
              'THUMBNAIL',
              %s,
              %s,
              'URL',
              ''
            )
            """,
            [product_id, url, url, url],
        )


def _update_description(product_id: int, new_description: str) -> None:
    with connection.cursor() as c:
        c.execute(
            """
            UPDATE et_product
            SET description = %s
            WHERE product_id = %s
              AND deleted_at IS NULL
            """,
            [new_description, product_id],
        )


def _cleanup_duplicate_thumbnails(start_id: int, end_id: int, apply: bool) -> int:
    """Keep only latest thumbnail (MAX(file_id)) per product in range; soft delete others."""
    with connection.cursor() as c:
        c.execute(
            """
            SELECT ref_id
            FROM et_file
            WHERE ref_type='product'
              AND file_role='THUMBNAIL'
              AND deleted_at IS NULL
              AND ref_id BETWEEN %s AND %s
            GROUP BY ref_id
            HAVING COUNT(*) > 1
            """,
            [start_id, end_id],
        )
        product_ids = [int(r[0]) for r in c.fetchall()]

    if not product_ids:
        print("duplicate_thumbnails=0")
        return 0

    affected = 0
    with connection.cursor() as c:
        for pid in product_ids:
            c.execute(
                """
                SELECT MAX(file_id)
                FROM et_file
                WHERE ref_type='product'
                  AND ref_id=%s
                  AND file_role='THUMBNAIL'
                  AND deleted_at IS NULL
                """,
                [pid],
            )
            keep_id = c.fetchone()[0]

            if apply:
                c.execute(
                    """
                    UPDATE et_file
                    SET deleted_at = NOW()
                    WHERE ref_type='product'
                      AND ref_id=%s
                      AND file_role='THUMBNAIL'
                      AND deleted_at IS NULL
                      AND file_id <> %s
                    """,
                    [pid, keep_id],
                )
                affected += int(c.rowcount)

            print(f"cleanup product_id={pid} keep_file_id={keep_id} apply={apply}")

    print(f"duplicate_products={len(product_ids)} deleted_rows={affected} applied={apply}")
    return affected


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--start-id", type=int, default=1)
    ap.add_argument("--end-id", type=int, default=100)
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--no-skip-if-thumbnail-exists", action="store_true")
    ap.add_argument("--cleanup-duplicate-thumbnails", action="store_true")
    args = ap.parse_args()

    start_id = int(args.start_id)
    end_id = int(args.end_id)
    apply = bool(args.apply)
    skip_if_thumbnail_exists = not bool(args.no_skip_if_thumbnail_exists)
    cleanup_duplicate_thumbnails = bool(args.cleanup_duplicate_thumbnails)

    if start_id > end_id:
        raise SystemExit("start-id must be <= end-id")

    with connection.cursor() as c:
        c.execute(
            """
            SELECT product_id, description
            FROM et_product
            WHERE product_id BETWEEN %s AND %s
              AND deleted_at IS NULL
            ORDER BY product_id ASC
            """,
            [start_id, end_id],
        )
        rows = c.fetchall()

    total = len(rows)
    candidates = 0
    inserted = 0
    updated = 0
    skipped_exists = 0
    skipped_no_token = 0

    with transaction.atomic():
        if cleanup_duplicate_thumbnails:
            _cleanup_duplicate_thumbnails(start_id, end_id, apply)

        for (product_id, description) in rows:
            new_desc, url = _extract_image_url(description or "")
            if not url:
                skipped_no_token += 1
                continue

            candidates += 1

            exists = _has_thumbnail(int(product_id))
            if exists and skip_if_thumbnail_exists:
                skipped_exists += 1
                continue

            if apply:
                _insert_thumbnail(int(product_id), url)
                inserted += 1
                _update_description(int(product_id), new_desc)
                updated += 1

            print(
                f"product_id={product_id} url={url} "
                f"thumbnail_exists={exists} apply={apply}"
            )

        if not apply:
            transaction.set_rollback(True)

    print(
        "\n".join(
            [
                f"total_products_scanned={total}",
                f"candidates_with_img_token={candidates}",
                f"skipped_no_token={skipped_no_token}",
                f"skipped_thumbnail_exists={skipped_exists}",
                f"inserted_thumbnails={inserted}",
                f"updated_descriptions={updated}",
                f"applied={apply}",
            ]
        )
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

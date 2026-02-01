import os
import sys
import argparse
from pathlib import Path
from datetime import date

current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django

django.setup()

from django.db import connection, transaction


def _ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def _render_png(path: Path, text: str, size=(512, 512), bg=(245, 245, 245), fg=(30, 30, 30)) -> None:
    try:
        from PIL import Image, ImageDraw, ImageFont
    except Exception as e:
        raise RuntimeError("Pillow(PIL) is required") from e

    img = Image.new("RGB", size, bg)
    d = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("arial.ttf", 28)
    except Exception:
        font = ImageFont.load_default()

    d.text((20, 20), text, fill=fg, font=font)
    img.save(path, format="PNG")


def _soft_delete_existing(product_ids: list[int]) -> int:
    if not product_ids:
        return 0

    with connection.cursor() as c:
        c.execute(
            """
            UPDATE et_file
            SET deleted_at = NOW()
            WHERE ref_type = 'product'
              AND file_role IN ('THUMBNAIL', 'CONTENT')
              AND deleted_at IS NULL
              AND ref_id IN ("""
            + ",".join(["%s"] * len(product_ids))
            + ")",
            product_ids,
        )
        return int(c.rowcount)


def _insert_file(ref_id: int, role: str, file_url: str) -> None:
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
              %s,
              %s,
              %s,
              'LOCAL',
              %s
            )
            """,
            [ref_id, file_url, role, file_url, file_url, ""],
        )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--start-id", type=int, default=1)
    ap.add_argument("--end-id", type=int, default=100)
    ap.add_argument("--detail-product-id", type=int, default=1)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    upload_dir = os.getenv("FILE_UPLOAD_DIR", "").strip()
    if not upload_dir:
        raise SystemExit("FILE_UPLOAD_DIR env is required")

    start_id = int(args.start_id)
    end_id = int(args.end_id)
    detail_pid = int(args.detail_product_id)
    apply = bool(args.apply)

    day = date.today().isoformat()

    base = Path(upload_dir) / "products" / day
    _ensure_dir(base)

    product_ids = list(range(start_id, end_id + 1))

    # Generate files
    thumb_map: dict[int, str] = {}
    for pid in product_ids:
        fname = f"product-{pid:03d}.png"
        fpath = base / fname
        _render_png(fpath, f"PRODUCT {pid}\nTHUMBNAIL")
        thumb_map[pid] = f"/uploads/products/{day}/{fname}"

    detail_url = None
    if start_id <= detail_pid <= end_id:
        detail_name = f"product-{detail_pid:03d}-detail.png"
        detail_path = base / detail_name
        _render_png(detail_path, f"PRODUCT {detail_pid}\nDETAIL", size=(900, 1200))
        detail_url = f"/uploads/products/{day}/{detail_name}"

    print(f"FILE_UPLOAD_DIR={upload_dir}")
    print(f"generated_thumbnails={len(thumb_map)}")
    print(f"generated_detail_for_product={detail_pid if detail_url else None}")
    print(f"apply={apply}")

    with transaction.atomic():
        if apply:
            deleted = _soft_delete_existing(product_ids)
            print(f"soft_deleted_existing_rows={deleted}")

            for pid, url in thumb_map.items():
                _insert_file(pid, "THUMBNAIL", url)

            if detail_url:
                _insert_file(detail_pid, "CONTENT", detail_url)

        else:
            transaction.set_rollback(True)

    print("DONE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

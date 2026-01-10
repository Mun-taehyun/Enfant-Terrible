# ml/management/commands/import_integrated_scores.py

from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from ml.services.recommendations_batch import rebuild_usercf_recommendations_from_csv


def _clamp(n: int, lo: int, hi: int) -> int:
    try:
        v = int(n)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(v, hi))


class Command(BaseCommand):
    help = "Rebuild et_user_recommendation using team user-cf cosine batch."

    def add_arguments(self, parser):
        parser.add_argument(
            "--path",
            type=str,
            default=str(getattr(settings, "SERVICE_READY_CSV")),
            help="CSV path (user_id, product_id, final_preference)",
        )
        parser.add_argument("--limit", type=int, default=5)
        parser.add_argument("--similar-k", type=int, default=10)
        parser.add_argument("--truncate", action="store_true")

    def handle(self, *args, **opts):
        csv_path = Path(opts["path"])
        top_n = _clamp(opts.get("limit", 5), 1, 50)
        similar_k = _clamp(opts.get("similar_k", 10), 1, 50)
        truncate = bool(opts.get("truncate"))

        inserted = rebuild_usercf_recommendations_from_csv(
            csv_path=csv_path,
            top_n=top_n,
            similar_k=similar_k,
            truncate=truncate,
        )

        self.stdout.write(self.style.SUCCESS(f"[DONE] inserted_rows={inserted}"))

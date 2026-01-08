from __future__ import annotations

import time
import signal
from typing import Optional

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """
    Django 내부에서 스케줄러를 구동하는 전용 프로세스

    실행:
      python manage.py run_reco_scheduler

    기본 동작:
      매일 03:00(서버 TIME_ZONE 기준) rebuild_recommendations 실행
    """

    help = "Run daily recommendation batch scheduler (Django-only)."

    def add_arguments(self, parser):
        parser.add_argument("--hour", type=int, default=3)
        parser.add_argument("--minute", type=int, default=0)
        parser.add_argument("--limit", type=int, default=50)
        parser.add_argument("--days", type=int, default=180)
        parser.add_argument("--truncate", action="store_true")
        parser.add_argument("--run-once", action="store_true", help="run batch once and exit")

    def handle(self, *args, **opts):
        hour = int(opts.get("hour", 3))
        minute = int(opts.get("minute", 0))
        limit = int(opts.get("limit", 50))
        days = int(opts.get("days", 180))
        truncate = bool(opts.get("truncate"))
        run_once = bool(opts.get("run_once"))

        tz = getattr(settings, "TIME_ZONE", "Asia/Seoul")

        if run_once:
            self.stdout.write("[scheduler] run-once mode: calling rebuild_recommendations then exit")
            self._run_batch(limit=limit, days=days, truncate=truncate)
            self.stdout.write(self.style.SUCCESS("[scheduler] done"))
            return

        scheduler = BlockingScheduler(timezone=tz)

        trigger = CronTrigger(hour=hour, minute=minute, timezone=tz)

        scheduler.add_job(
            func=self._run_batch,
            trigger=trigger,
            id="daily_rebuild_recommendations",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
            misfire_grace_time=3600,
            kwargs={"limit": limit, "days": days, "truncate": truncate},
        )

        self.stdout.write(
            f"[scheduler] started. timezone={tz} schedule=daily {hour:02d}:{minute:02d} limit={limit} days={days} truncate={truncate}"
        )

        # Ctrl+C 등 종료 시 안전 종료
        def _graceful_shutdown(signum, frame):
            self.stdout.write("[scheduler] shutdown requested. stopping...")
            try:
                scheduler.shutdown(wait=False)
            except Exception:
                pass

        signal.signal(signal.SIGINT, _graceful_shutdown)
        signal.signal(signal.SIGTERM, _graceful_shutdown)

        try:
            scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            pass

        self.stdout.write("[scheduler] stopped")

    def _run_batch(self, limit: int, days: int, truncate: bool) -> None:
        """
        APScheduler job 함수: rebuild_recommendations 관리명령 실행
        """
        self.stdout.write("[batch] starting rebuild_recommendations...")
        args = ["--limit", str(limit), "--days", str(days)]
        if truncate:
            args.append("--truncate")

        try:
            call_command("rebuild_recommendations", *args)
            self.stdout.write("[batch] rebuild_recommendations completed")
        except Exception as e:
            # 예외는 로그로 남기고 스케줄러는 계속 살아있게 둠
            self.stdout.write(f"[batch][ERROR] {type(e).__name__}: {e}")

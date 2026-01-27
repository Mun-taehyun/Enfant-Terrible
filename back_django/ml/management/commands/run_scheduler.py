#ml/management/commeands/run_scheduler.py
# 그냥 스케쥴러 파일. 배치 돌려준다. 매일 03:00 (TIME_ZONE 기준) import_integrated_scores 실행


from __future__ import annotations

import signal

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """
    실행:
      python manage.py run_scheduler

    기본 동작:
      매일 03:00 (TIME_ZONE 기준) import_integrated_scores 실행
    """

    help = "Run daily recommendation rebuild scheduler."

    def add_arguments(self, parser):
        parser.add_argument("--hour", type=int, default=3)
        parser.add_argument("--minute", type=int, default=0)

        # import_integrated_scores로 그대로 전달할 옵션들
        parser.add_argument("--limit", type=int, default=50)
        parser.add_argument("--truncate", action="store_true")

        # 운영에서는 보통 전체 대상 / 더미 생성 금지
        parser.add_argument("--user-id", type=int, default=None)
        parser.add_argument("--user-max", type=int, default=None)
        parser.add_argument("--user-limit", type=int, default=None)
        parser.add_argument("--seed-dummy-users", action="store_true")

        parser.add_argument("--run-once", action="store_true", help="run once and exit")

    def handle(self, *args, **opts):
        hour = int(opts.get("hour", 3))
        minute = int(opts.get("minute", 0))

        limit = int(opts.get("limit", 50))
        truncate = bool(opts.get("truncate"))

        user_id = opts.get("user_id")
        user_max = opts.get("user_max")
        user_limit = opts.get("user_limit")
        seed_dummy_users = bool(opts.get("seed_dummy_users"))

        run_once = bool(opts.get("run_once"))
        tz = getattr(settings, "TIME_ZONE", "Asia/Seoul")

        if run_once:
            self._run_batch(
                limit=limit,
                truncate=truncate,
                user_id=user_id,
                user_max=user_max,
                user_limit=user_limit,
                seed_dummy_users=seed_dummy_users,
            )
            self.stdout.write(self.style.SUCCESS("[scheduler] done (run-once)"))
            return

        scheduler = BlockingScheduler(timezone=tz)
        trigger = CronTrigger(hour=hour, minute=minute, timezone=tz)

        scheduler.add_job(
            func=self._run_batch,
            trigger=trigger,
            id="daily_import_integrated_scores",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
            misfire_grace_time=3600,
            kwargs={
                "limit": limit,
                "truncate": truncate,
                "user_id": user_id,
                "user_max": user_max,
                "user_limit": user_limit,
                "seed_dummy_users": seed_dummy_users,
            },
        )

        self.stdout.write(
            f"[scheduler] started. timezone={tz} schedule=daily {hour:02d}:{minute:02d} "
            f"limit={limit} truncate={truncate}"
        )

        def _shutdown(signum, frame):
            try:
                scheduler.shutdown(wait=False)
            except Exception:
                pass

        signal.signal(signal.SIGINT, _shutdown)
        signal.signal(signal.SIGTERM, _shutdown)

        try:
            scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            pass

        self.stdout.write("[scheduler] stopped")

    def _run_batch(self, **kwargs):
        self.stdout.write(f"[batch] calling import_integrated_scores with {kwargs}")
        args = ["--limit", str(int(kwargs["limit"]))]

        if kwargs.get("truncate"):
            args.append("--truncate")
        if kwargs.get("user_id") is not None:
            args += ["--user-id", str(int(kwargs["user_id"]))]
        if kwargs.get("user_max") is not None:
            args += ["--user-max", str(int(kwargs["user_max"]))]
        if kwargs.get("user_limit") is not None:
            args += ["--user-limit", str(int(kwargs["user_limit"]))]
        if kwargs.get("seed_dummy_users"):
            args.append("--seed-dummy-users")

        call_command("import_integrated_scores", *args)
        self.stdout.write("[batch] import_integrated_scores completed")

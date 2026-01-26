# ml/management/commands/import_integrated_scores.py

from __future__ import annotations
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand

# 서비스 로직 임포트
from ml.services.recommendations_batch import rebuild_usercf_recommendations_from_csv

def _clamp(n: int, lo: int, hi: int) -> int:
    """입력값을 최소/최대 범위 내로 고정하는 유틸리티 함수"""
    try:
        v = int(n)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(v, hi))

class Command(BaseCommand):
    help = "Rebuild et_user_recommendation using team user-cf cosine batch."

    def add_arguments(self, parser):
        # [수정 포인트] 기본 경로를 ai_analysis가 아닌 프로젝트 루트의 logs 폴더로 설정
        # settings.BASE_DIR(back_django)의 부모 폴더에 있는 logs 폴더를 참조합니다.
        default_csv_path = Path(settings.BASE_DIR).parent / "logs" / "service_ready_data.csv"

        parser.add_argument(
            "--path",
            type=str,
            default=str(default_csv_path),
            help="추천 소스 CSV 경로 (user_id, product_id, final_preference)",
        )
        parser.add_argument("--limit", type=int, default=5, help="사용자당 추천 상품 개수")
        parser.add_argument("--similar-k", type=int, default=10, help="유사 사용자 참고 수")
        parser.add_argument("--truncate", action="store_true", help="기존 추천 데이터를 삭제하고 새로 생성")

    def handle(self, *args, **opts):
        # 1. 경로 설정 확인
        csv_path = Path(opts["path"])
        top_n = _clamp(opts.get("limit", 5), 1, 50)
        similar_k = _clamp(opts.get("similar_k", 10), 1, 50)
        truncate = bool(opts.get("truncate"))

        self.stdout.write(f"🔍 다음 경로에서 데이터를 찾습니다: {csv_path}")

        # 2. 파일 존재 여부 체크 (파일이 없으면 친절하게 안내)
        if not csv_path.exists():
            self.stdout.write(self.style.ERROR(
                f"❌ CSV 파일이 없습니다: {csv_path}\n"
                "먼저 브라우저에서 /api/admin/recommendation/update/ 주소를 호출하여 파일을 생성해 주세요."
            ))
            return

        # 3. 추천 엔진 실행
        try:
            inserted = rebuild_usercf_recommendations_from_csv(
                csv_path=csv_path,
                top_n=top_n,
                similar_k=similar_k,
                truncate=truncate,
            )
            self.stdout.write(self.style.SUCCESS(f"✅ 성공적으로 완료되었습니다. 생성된 행: {inserted}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"💥 실행 중 오류 발생: {str(e)}"))
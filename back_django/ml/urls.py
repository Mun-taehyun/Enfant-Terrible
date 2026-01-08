from django.urls import path
from . import views
urlpatterns = [
    # GET /api/recommendation
    path(
        "recommendation",                  # 프리픽스는 config urls에 적음
        views.recommendation,              # url 요청이 오면 "뷰로 가라!"
        name="recommendation",
    ),
]
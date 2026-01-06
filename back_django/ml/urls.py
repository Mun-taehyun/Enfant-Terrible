from django.urls import path
from . import views
urlpatterns = [
    # GET /api/v1/product/<productID>/recommend-list
    path(
        "recommendation",                  # 프리픽스는 config urls에 적음
        views.recommendation,                                       # url 요청이 오면 이쪽 뷰로 안내
        name="recommendation",
    ),
]
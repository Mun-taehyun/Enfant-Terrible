from django.urls import path
from . import views
urlpatterns = [
    # GET /api/v1/product/<productID>/recommend-list
    path(
        "product/<int:product_id>/recommend-list/",                  # 프리픽스는 config urls에 적음
        views.recommend_list,                                       # url 요청이 오면 이쪽 뷰로 안내
        name="recommend_list",
    ),
]
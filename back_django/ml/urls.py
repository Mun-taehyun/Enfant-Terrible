from django.urls import path
from . import views

# 반드시 이름이 'urlpatterns' (복수형) 리스트여야 합니다.
urlpatterns = [
    # 1. 개인 맞춤 추천 API
    path(
        "recommendations/user/<int:user_id>/", 
        views.get_user_specific_recommendations, 
        name="user_recommendation",
    ),

    # 2. 범용 인기 추천 API
    path(
        "recommendations/popular/", 
        views.get_popular_recommendations, 
        name="popular_recommendation",
    ),

    # 3. 반려동물 종별 인기 추천 API
    path(
        "recommendations/popular/<str:species>/", 
        views.get_popular_recommendations, 
        name="species_popular_recommendation",
    ),

    # 4. 카테고리별 추천 API
    path(
        "recommendations/category/<int:category_id>/",
        views.get_category_recommendations,
        name="category_recommendation",
    ),

    # 5. 관리자용: AI 추천 엔진 수동 갱신 (rebuild)
    path(
        "admin/recommendation/rebuild/", 
        views.trigger_recommendation_rebuild, 
        name="admin_recommendation_rebuild",
    ),
]
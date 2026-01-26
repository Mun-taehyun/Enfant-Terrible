from django.urls import path
from . import views

urlpatterns = [
    # 1. 특정 사용자 맞춤 추천 조회 API
    # 예: GET /api/recommendations/1/ (user_id 1번 추천 상품 목록)
    path(
        "recommendations/<int:user_id>/", 
        views.recommendation, 
        name="user_recommendation",
    ),

    # 2. 개인화되지 않은 전체 인기 추천 (로그인 안 한 유저용 등)
    # 예: GET /api/recommendations/popular/
    path(
        "recommendations/popular/", 
        views.popular_recommendation_view, # 별도 뷰가 있다면 연결
        name="popular_recommendation",
    ),

    # 3. 관리자용 추천 엔진 강제 업데이트 (POST 권장)
    # 예: POST /api/admin/recommendation/update/
    path(
        "admin/recommendation/update/", 
        views.admin_recommendation_update, 
        name="admin_recommendation_update",
    ),
]
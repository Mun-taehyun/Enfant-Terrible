from django.urls import path
from . import views

urlpatterns = [
    # GET /api/recommendation
    path(
        "recommendation", 
        views.recommendation, 
        name="recommendation",
    ),
    # POST /api/admin/recommendationupdate
    path(
        "admin/recommendationupdate", 
        views.admin_recommendation_update, 
        name="admin_recommendation_update",
    ),
]
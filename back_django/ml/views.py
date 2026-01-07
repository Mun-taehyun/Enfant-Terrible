# ml/views.py
from django.http import JsonResponse
from django.views.decorators.http import require_GET

@require_GET
def recommendation(request):
    try:
        limit = int(request.GET.get("limit", "5"))
    except ValueError:
        limit = 5
    limit = max(1, min(limit, 50))

    # JWT 붙기 전 임시 확인용 (나중에 제거 가능)
    user_id = request.GET.get("userId")
    user_id = int(user_id) if user_id and user_id.isdigit() else None

    return JsonResponse({
        "userId": user_id,
        "recommendations": []
    })

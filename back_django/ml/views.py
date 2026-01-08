from django.http import JsonResponse
from django.views.decorators.http import require_GET
from ml.auth import get_user_id_from_request
from ml.services.recommendations import recommend_for_user

@require_GET
def recommendation(request):
    try:
        limit = int(request.GET.get("limit", "5"))
    except ValueError:
        limit = 5
    limit = max(1, min(limit, 50))

    user_id = get_user_id_from_request(request)
    if user_id is None:
        return JsonResponse({"detail": "Unauthorized"}, status=401)
    
    recommendations = recommend_for_user(user_id, limit)

    return JsonResponse({
        "userId": user_id,
        "recommendations": recommendations,
    })

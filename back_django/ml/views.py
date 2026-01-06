from django.http import JsonResponse    # JSON 받는 거
from django.views.decorators.http import require_GET        # GET만 응답하는 거
from ml.services.recommendations import recommend_core


@require_GET #GET만 가능
def recommendation(request, product_id: int):

    try:
        limit = int(request.GET.get("limit","5"))                      # 추천개수
    except ValueError:                                                  # 예외처리
        limit = 5                                                       # 정수 이외의 뭔가가 들어오면 5로 변환
    limit = max(1,min(limit, 50))                                       # 제한 건다    
        
        
    recommendations = recommend_core(product_id=product_id, limit=limit)        # recommendations = 추천    
    return JsonResponse({                                                       # 최종 JSON 응답 반환.  밑에 뭐 넣어야 할지 확인    
        "productId": int(product_id),
        "recommendations": recommendations
    })

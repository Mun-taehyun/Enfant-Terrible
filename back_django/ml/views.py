from django.shortcuts import render     # 몰라 원래 있던 거
from django.http import JsonResponse    # JSON 받는 거
from django.views.decorators.http import require_GET        # GET만 응답하는 거

def _recommend_core(product_id: int, limit: int) -> list[dict]:         # recommend_core은 추천 계산
    """
    나중에 진짜 모델 나오면 이 함수만 바꾸면 됩니다.
    반환 형식은 그대로 유지하세요:
    [{"productId": int, "score": float}, ...]
    """
    # 더미 추천 (임시)
    rec_ids = []
    cur = product_id + 1
    while len(rec_ids) < limit:
        if cur != product_id:
            rec_ids.append(cur)
        cur += 1
    ################################## 이 윗부분을 진짜로 교체하면 됨 아래 return안에 들어 갈 것들도.
    return [{"productId": rid, "score": 0.0} for rid in rec_ids]



@require_GET #GET만 가능
def recommend_list(request, product_id: int):
    limit_raw = request.GET.get("limit", "10")      # limit_raw 문자열

    try:
        limit = int(limit_raw)                      # limit 정수
        if limit <= 0:                              # 추천 개수 1 이상이어야 의미가 있으니 0이면 에러
            raise ValueError    
        if limit > 50:                              # 일단 50개 상한으로 둠. 상한이 있을테니 일단 가짜로 만듦
            limit = 50
    except ValueError:
        return JsonResponse({"message": "limit must be 1~50"}, status=400) # 이러한 것들 전부 400에러로 돌림

    recommendations = _recommend_core(product_id, limit)        # recommendations = 추천

    return JsonResponse(                                # 최종 JSON 응답 반환.  밑에 뭐 넣어야 할지 확인
        {
            "productId": product_id,                    # 상품ID
            "recommendations": recommendations,         # 추천 결과 리스트 
        },
        status=200,
        json_dumps_params={"ensure_ascii": False},          # 한글이 깨지지 않는 설정이라는데
    )
# ml/services/recommendations.py
# 함수 계산 부분만 따로 뺌


def recommend_core(product_id: int, limit: int) -> list[dict]:
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
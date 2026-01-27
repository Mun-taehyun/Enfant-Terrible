import jwt
from django.conf import settings
from jwt import InvalidTokenError, ExpiredSignatureError

def get_user_id_from_request(request) -> int | None:
    # 어떤 환경에서는 Authorization이 request.META에만 들어오는 경우가 있어서 보강
    auth = (
        request.headers.get("Authorization")
        or request.META.get("HTTP_AUTHORIZATION")
        or ""
    ).strip()

    # 기대 형식: "Bearer <token>"
    if not auth.startswith("Bearer "):
        return None

    # "Bearer " 다음부터가 토큰
    token = auth[7:].strip()
    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except (ExpiredSignatureError, InvalidTokenError):
        return None

    uid = payload.get("userId")
    try:
        return int(uid)
    except (TypeError, ValueError):
        return None

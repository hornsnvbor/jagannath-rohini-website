from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.config import settings

bearer_scheme = HTTPBearer(auto_error=False)

SESSION_COOKIE = "admin_session"

# Using the `bcrypt` library directly (not passlib) — passlib's bcrypt
# wrapper has known version-detection breakage on newer bcrypt releases.


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        sub: str | None = payload.get("sub")
        return sub if sub else None
    except JWTError:
        return None


def session_cookie_options() -> dict:
    """httpOnly session cookie settings (secure in production, lax samesite)."""
    return {
        "key": SESSION_COOKIE,
        "httponly": True,
        "secure": settings.is_production,
        "samesite": "lax",
        "max_age": settings.JWT_EXPIRE_MINUTES * 60,
        "path": "/",
    }


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    request: Request = None,
) -> str:
    """FastAPI dependency — protects every admin-only route. Accepts the JWT
    either in the Authorization header (Bearer) or in the httpOnly
    `admin_session` cookie. Returns 401 for a missing, invalid, or expired
    token. Use as: Depends(require_admin)."""
    token: str | None = credentials.credentials if credentials else None
    if not token and request:
        token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    sub = _decode_token(token)
    if sub is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return sub

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials
from app.limiter import limiter

from app.config import settings
from app.schemas import AdminLogin
from app.security import (
    _decode_token,
    bearer_scheme,
    create_access_token,
    session_cookie_options,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
@limiter.limit("5/minute")  # brute-force protection on the login endpoint specifically
def login(request: Request, response: Response, payload: AdminLogin):
    # Single-admin model deliberately: temple committee has one shared login
    # for now. Constant-shape response either way to avoid user enumeration.
    if payload.email.lower() != settings.ADMIN_EMAIL.lower() or not verify_password(
        payload.password, settings.ADMIN_PASSWORD_HASH
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=settings.ADMIN_EMAIL)
    response.set_cookie(value=token, **session_cookie_options())
    # Frontend stores the token in localStorage and sends it as `Authorization:
    # Bearer <token>` on every admin call — it MUST be in the response body.
    # The httpOnly cookie stays as a secondary channel for /me and server-side
    # flows that can't read localStorage.
    return {
        "authenticated": True,
        "email": settings.ADMIN_EMAIL,
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/logout")
def logout(response: Response):
    # Expire the httpOnly session cookie client-side.
    opts = session_cookie_options()
    opts.pop("max_age", None)
    response.delete_cookie(key=opts.pop("key"), **opts)
    return {"authenticated": False}


@router.get("/me")
def me(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """Tells the admin UI whether a valid session exists. Accepts the JWT from
    either the Authorization header (Bearer, what the frontend sends) or the
    httpOnly `admin_session` cookie."""
    token = credentials.credentials if credentials else request.cookies.get("admin_session")
    if not token:
        return {"authenticated": False}
    sub = _decode_token(token)
    if sub is None:
        return {"authenticated": False}
    return {"authenticated": True, "email": sub}

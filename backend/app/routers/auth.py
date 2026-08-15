from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from app.limiter import limiter

from app.config import settings
from app.schemas import AdminLogin
from app.security import create_access_token, session_cookie_options, verify_password

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
    return {"authenticated": True, "email": settings.ADMIN_EMAIL}


@router.post("/logout")
def logout(response: Response):
    # Expire the httpOnly session cookie client-side.
    opts = session_cookie_options()
    opts.pop("max_age", None)
    response.delete_cookie(key=opts.pop("key"), **opts)
    return {"authenticated": False}


@router.get("/me")
def me(request: Request):
    """Tells the admin UI whether a valid session cookie exists."""
    token = request.cookies.get("admin_session")
    if not token:
        return {"authenticated": False}
    from app.security import _decode_token

    sub = _decode_token(token)
    if sub is None:
        return {"authenticated": False}
    return {"authenticated": True, "email": sub}

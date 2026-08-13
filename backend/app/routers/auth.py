from fastapi import APIRouter, HTTPException, Request, status
from app.limiter import limiter

from app.config import settings
from app.schemas import AdminLogin, Token
from app.security import create_access_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")  # brute-force protection on the login endpoint specifically
def login(request: Request, payload: AdminLogin):
    # Single-admin model deliberately: temple committee has one shared login
    # for now. Constant-shape response either way to avoid user enumeration.
    if payload.email.lower() != settings.ADMIN_EMAIL.lower() or not verify_password(
        payload.password, settings.ADMIN_PASSWORD_HASH
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=settings.ADMIN_EMAIL)
    return Token(access_token=token)

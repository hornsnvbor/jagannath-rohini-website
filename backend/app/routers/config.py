from fastapi import APIRouter

from app.config import settings

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("")
def public_config():
    """Runtime config the public frontend needs. Only PUBLISHABLE values are
    returned here — never secrets. Razorpay Key ID is safe to expose (the
    dashboard calls it the 'Key ID'); the Key Secret never leaves the server."""
    return {
        "razorpay_key_id": settings.RAZORPAY_KEY_ID,
        "smtp_configured": bool(settings.SMTP_FROM),
        "environment": settings.ENVIRONMENT,
    }
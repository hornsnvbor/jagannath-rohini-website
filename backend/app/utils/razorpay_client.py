import hashlib
import hmac

import razorpay

from app.config import settings

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_order(amount_rupees: float, receipt: str, notes: dict) -> dict:
    """Amount must be converted to paise (smallest unit) — Razorpay requires this."""
    amount_paise = int(round(amount_rupees * 100))
    return client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt,
        "notes": notes,
        "payment_capture": 1,
    })


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verifies the checkout-side signature Razorpay sends back to the frontend.
    This alone is NOT sufficient to mark a donation paid — always confirm via
    the server-to-server webhook too (see routers/donations.py)."""
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })
        return True
    except razorpay.errors.SignatureVerificationError:
        return False


def verify_webhook_signature(raw_body: bytes, received_signature: str) -> bool:
    """Verifies the X-Razorpay-Signature header on incoming webhook calls
    using HMAC-SHA256 with the webhook secret (set separately in the Razorpay
    dashboard, NOT the same as the API key secret). This is the ONLY signal
    the backend trusts to mark a donation as paid."""
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, received_signature)


# ---------------------------------------------------------------------------
# Subscriptions (recurring Dainik Sewa). A monthly plan is created once and
# cached; subsequent subscriptions reuse it.
# ---------------------------------------------------------------------------
_dainik_plan_id: str | None = None


def _get_dainik_plan_id() -> str:
    global _dainik_plan_id
    if settings.DAINIK_SEWA_PLAN_ID:
        return settings.DAINIK_SEWA_PLAN_ID
    if _dainik_plan_id:
        return _dainik_plan_id
    plan = client.plan.create({
        "period": "monthly",
        "interval": 1,
        "item": {
            "name": "Dainik Sewa – ₹200/month",
            "amount": 20000,  # ₹200.00 in paise
            "currency": "INR",
        },
        "notes": {"purpose": "Recurring Dainik Sewa Membership"},
    })
    _dainik_plan_id = plan["id"]
    return _dainik_plan_id


def create_dainik_subscription(notes: dict, email: str, contact: str, total_count: int = 12) -> dict:
    """Create a recurring ₹200/month subscription for the Dainik Sewa form.
    Returns the subscription dict (with an `id`) from Razorpay."""
    return client.subscription.create({
        "plan_id": _get_dainik_plan_id(),
        "total_count": total_count,
        "quantity": 1,
        "customer_notify": 1,
        "notes": notes,
        "customer": {"email": email, "contact": contact},
    })


def verify_subscription_signature(subscription_id: str, payment_id: str, signature: str) -> bool:
    """Verifies the checkout-side signature for a subscription setup payment
    (Razorpay sends these back to the frontend)."""
    try:
        client.utility.verify_payment_signature({
            "razorpay_subscription_id": subscription_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })
        return True
    except razorpay.errors.SignatureVerificationError:
        return False

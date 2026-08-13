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

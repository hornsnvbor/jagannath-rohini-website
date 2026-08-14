import hashlib
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import get_db
from app.limiter import limiter
from app.models import (
    DainikSewaForm,
    FormStatus,
    ProcessedWebhookEvent,
    SocietyMembershipForm,
)
from app.schemas import (
    DAINIK_SEWA_ONE_TIME_AMOUNT,
    SOCIETY_MEMBERSHIP_AMOUNTS,
    DainikSewaCreate,
    MembershipOrderOut,
    MembershipVerify,
    SocietyMembershipCreate,
    SubscriptionVerify,
)
from app.security import require_admin
from app.utils.razorpay_client import (
    create_dainik_subscription,
    create_order,
    verify_payment_signature,
    verify_subscription_signature,
    verify_webhook_signature,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/forms", tags=["membership-forms"])
logger = logging.getLogger("membership-forms")

_ONLINE = "online"


def _confirm_email(form_type: str, email: str, name: str):
    """Return a BackgroundTask (or None) that emails the applicant."""
    from starlette.background import BackgroundTask

    from app.utils.notify import send_form_confirmation

    if not settings.SMTP_FROM:
        return None
    return BackgroundTask(send_form_confirmation, form_type, email, name)


def _created_response(result: MembershipOrderOut, form_type: str, email: str, name: str) -> JSONResponse:
    """201 response with the order payload and an optional background email."""
    task = _confirm_email(form_type, email, name)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=result.model_dump(),
        background=task,
    )


def _order_or_raise(amount: float, receipt: str, notes: dict) -> dict:
    try:
        return create_order(amount_rupees=amount, receipt=receipt, notes=notes)
    except Exception:
        logger.exception("Razorpay order creation failed for %s", receipt)
        raise HTTPException(status_code=502, detail="Could not initiate payment. Please try again.")


# ---------------------------------------------------------------------------
# Form 1 — Society Membership
# ---------------------------------------------------------------------------


@router.post("/society", response_model=MembershipOrderOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_FORMS)
def create_society(request: Request, payload: SocietyMembershipCreate, db: Session = Depends(get_db)):
    amount = SOCIETY_MEMBERSHIP_AMOUNTS[payload.membership_type]
    entry = SocietyMembershipForm(
        membership_type=payload.membership_type,
        membership_amount=amount,
        name=payload.name,
        father_husband_name=payload.father_husband_name,
        gotra=payload.gotra,
        dob=payload.dob,
        blood_group=payload.blood_group,
        residence_address=payload.residence_address,
        office_address=payload.office_address,
        residence_telephone=payload.residence_telephone,
        office_telephone=payload.office_telephone,
        mobile=payload.mobile,
        fax=payload.fax,
        email=str(payload.email),
        pan=payload.pan,
        occupation_designation=payload.occupation_designation,
        introducing_member_name=payload.introducing_member_name,
        introducing_member_mobile=payload.introducing_member_mobile,
        member_photo=payload.member_photo,
        spouse_photo=payload.spouse_photo,
        pan_document=payload.pan_document,
        aadhaar_document=payload.aadhaar_document,
        payment_method=payload.payment_method,
        cheque_dd_number=payload.cheque_dd_number,
        payment_date=payload.payment_date,
        bank_drawn_on=payload.bank_drawn_on,
        amount_in_words=payload.amount_in_words,
        transaction_ref=payload.transaction_ref,
        place=payload.place,
        member_signature=payload.member_signature,
        terms_accepted=payload.terms_accepted,
        status=FormStatus.new,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    razorpay_order_id = None
    if payload.payment_method == _ONLINE:
        razorpay_order_id = _order_or_raise(
            amount, f"society_{entry.id}", {"form_id": entry.id, "form_type": "society"}
        )["id"]
        entry.razorpay_order_id = razorpay_order_id
        db.commit()
        db.refresh(entry)

    return _created_response(
        MembershipOrderOut(
            id=entry.id,
            razorpay_order_id=razorpay_order_id,
            razorpay_subscription_id=None,
            amount=amount,
            status=entry.status.value,
        ),
        "Society Membership",
        str(payload.email),
        payload.name,
    )


@router.post("/society/verify")
@limiter.limit(settings.RATE_LIMIT_FORMS)
def verify_society(request: Request, payload: MembershipVerify, db: Session = Depends(get_db)):
    entry = db.get(SocietyMembershipForm, payload.form_id)
    if not entry or entry.razorpay_order_id != payload.razorpay_order_id:
        raise HTTPException(status_code=404, detail="Membership form not found")

    if not verify_payment_signature(
        payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature
    ):
        raise HTTPException(status_code=400, detail="Payment verification failed")

    entry.razorpay_payment_id = payload.razorpay_payment_id
    db.commit()
    return {"message": "Payment received, confirming shortly.", "form_id": entry.id}


# ---------------------------------------------------------------------------
# Form 2 — Dainik Sewa Membership
# ---------------------------------------------------------------------------


@router.post("/dainik", response_model=MembershipOrderOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_FORMS)
def create_dainik(request: Request, payload: DainikSewaCreate, db: Session = Depends(get_db)):
    amount = DAINIK_SEWA_ONE_TIME_AMOUNT
    entry = DainikSewaForm(
        name=payload.name,
        gotra=payload.gotra,
        father_name=payload.father_name,
        spouse_name=payload.spouse_name,
        office_address=payload.office_address,
        residence_address=payload.residence_address,
        email=str(payload.email),
        office_telephone=payload.office_telephone,
        residence_telephone=payload.residence_telephone,
        mobile=payload.mobile,
        self_profession=payload.self_profession,
        spouse_profession=payload.spouse_profession,
        self_dob=payload.self_dob,
        spouse_dob=payload.spouse_dob,
        marriage_anniversary=payload.marriage_anniversary,
        child1_name=payload.child1_name,
        child1_birthday=payload.child1_birthday,
        child2_name=payload.child2_name,
        child2_birthday=payload.child2_birthday,
        child3_name=payload.child3_name,
        child3_birthday=payload.child3_birthday,
        self_blood_group=payload.self_blood_group,
        spouse_blood_group=payload.spouse_blood_group,
        temple_contribution=payload.temple_contribution,
        photo=payload.photo,
        consent=payload.consent,
        applicant_signature=payload.applicant_signature,
        one_time_amount=amount,
        payment_method=payload.payment_method,
        cheque_dd_number=payload.cheque_dd_number,
        payment_date=payload.payment_date,
        bank_drawn_on=payload.bank_drawn_on,
        amount_in_words=payload.amount_in_words,
        transaction_ref=payload.transaction_ref,
        recurring_consent=payload.recurring_consent,
        auto_payment_consent=payload.auto_payment_consent,
        recurring_payment_method=payload.recurring_payment_method,
        recurring_start_date=payload.recurring_start_date,
        recurring_ref_id=payload.recurring_ref_id,
        place=payload.place,
        status=FormStatus.new,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    razorpay_order_id = None
    razorpay_subscription_id = None
    if payload.payment_method == _ONLINE:
        razorpay_order_id = _order_or_raise(
            amount, f"dainik_{entry.id}", {"form_id": entry.id, "form_type": "dainik"}
        )["id"]
        entry.razorpay_order_id = razorpay_order_id

        if payload.recurring_consent and payload.auto_payment_consent:
            try:
                subscription = create_dainik_subscription(
                    notes={"form_id": entry.id, "form_type": "dainik"},
                    email=str(payload.email),
                    contact=payload.mobile,
                )
                razorpay_subscription_id = subscription["id"]
                entry.razorpay_subscription_id = razorpay_subscription_id
            except Exception:
                # Recurring setup failed — the one-time payment still stands and
                # the application is recorded. Admin can enroll offline later.
                logger.exception("Dainik subscription creation failed for form %s", entry.id)
        db.commit()
        db.refresh(entry)

    return _created_response(
        MembershipOrderOut(
            id=entry.id,
            razorpay_order_id=razorpay_order_id,
            razorpay_subscription_id=razorpay_subscription_id,
            amount=amount,
            status=entry.status.value,
        ),
        "Dainik Sewa Membership",
        str(payload.email),
        payload.name,
    )


@router.post("/dainik/verify")
@limiter.limit(settings.RATE_LIMIT_FORMS)
def verify_dainik(request: Request, payload: MembershipVerify, db: Session = Depends(get_db)):
    entry = db.get(DainikSewaForm, payload.form_id)
    if not entry or entry.razorpay_order_id != payload.razorpay_order_id:
        raise HTTPException(status_code=404, detail="Membership form not found")

    if not verify_payment_signature(
        payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature
    ):
        raise HTTPException(status_code=400, detail="Payment verification failed")

    entry.razorpay_payment_id = payload.razorpay_payment_id
    db.commit()
    return {"message": "Payment received, confirming shortly.", "form_id": entry.id}


@router.post("/dainik/subscription/verify")
@limiter.limit(settings.RATE_LIMIT_FORMS)
def verify_dainik_subscription(request: Request, payload: SubscriptionVerify, db: Session = Depends(get_db)):
    entry = db.get(DainikSewaForm, payload.form_id)
    if not entry or entry.razorpay_subscription_id != payload.razorpay_subscription_id:
        raise HTTPException(status_code=404, detail="Membership form not found")

    if not verify_subscription_signature(
        payload.razorpay_subscription_id, payload.razorpay_payment_id, payload.razorpay_signature
    ):
        raise HTTPException(status_code=400, detail="Subscription verification failed")

    entry.subscription_payment_id = payload.razorpay_payment_id
    entry.payment_status = "subscribed"
    db.commit()
    return {"message": "Your recurring Dainik Sewa auto-debit is set up. Jai Jagannath!", "form_id": entry.id}


# ---------------------------------------------------------------------------
# Webhook — authoritative payment confirmation (server-to-server only).
# ---------------------------------------------------------------------------


@router.post("/webhook", include_in_schema=False)
async def membership_webhook(request: Request, db: Session = Depends(get_db)):
    raw_body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if not verify_webhook_signature(raw_body, signature):
        logger.warning("Rejected membership webhook with invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    payload = await request.json()
    event = payload.get("event")
    event_id = payload.get("event_id") or hashlib.sha256(raw_body).hexdigest()
    bundle = payload.get("payload", {})
    payment = (bundle.get("payment") or {}).get("entity", {}) or {}
    subscription = (bundle.get("subscription") or {}).get("entity", {}) or {}
    order_id = payment.get("order_id")
    sub_id = subscription.get("id") or payment.get("subscription_id")
    payment_id = payment.get("id")

    if not order_id and not sub_id:
        return {"status": "ignored"}

    try:
        db.add(ProcessedWebhookEvent(event_id=event_id))
        db.flush()
    except IntegrityError:
        db.rollback()
        logger.info("Duplicate membership webhook event %s ignored", event_id)
        return {"status": "ok", "duplicate": True}

    if order_id:
        entry = (
            db.query(SocietyMembershipForm)
            .filter(SocietyMembershipForm.razorpay_order_id == order_id)
            .first()
        )
        if entry:
            if event == "payment.captured":
                entry.payment_status = "paid"
                entry.razorpay_payment_id = payment_id
            elif event == "payment.failed":
                entry.payment_status = "failed"
            db.commit()
            return {"status": "ok"}

        entry = db.query(DainikSewaForm).filter(DainikSewaForm.razorpay_order_id == order_id).first()
        if entry:
            if event == "payment.captured":
                entry.payment_status = "paid"
                entry.razorpay_payment_id = payment_id
            elif event == "payment.failed":
                entry.payment_status = "failed"
            db.commit()
            return {"status": "ok"}

        logger.warning("Membership webhook for unknown order_id %s", order_id)
        db.rollback()
        return {"status": "ignored"}

    if sub_id:
        entry = db.query(DainikSewaForm).filter(DainikSewaForm.razorpay_subscription_id == sub_id).first()
        if not entry:
            logger.warning("Subscription webhook for unknown subscription %s", sub_id)
            db.rollback()
            return {"status": "ignored"}
        if event == "subscription.authenticated":
            entry.payment_status = "subscribed"
        elif event == "subscription.charged":
            entry.subscription_payment_id = payment_id or entry.subscription_payment_id
            entry.payment_status = "subscribed"
        db.commit()
        return {"status": "ok"}

    db.rollback()
    return {"status": "ignored"}


# ---------------------------------------------------------------------------
# Admin views
# ---------------------------------------------------------------------------


@router.get("/society", dependencies=[Depends(require_admin)])
def list_society(db: Session = Depends(get_db)):
    rows = db.query(SocietyMembershipForm).order_by(SocietyMembershipForm.created_at.desc()).limit(500).all()
    return [
        {
            "id": r.id, "membership_type": r.membership_type, "membership_amount": float(r.membership_amount),
            "name": r.name, "father_husband_name": r.father_husband_name, "gotra": r.gotra,
            "dob": r.dob, "blood_group": r.blood_group, "residence_address": r.residence_address,
            "office_address": r.office_address, "residence_telephone": r.residence_telephone,
            "office_telephone": r.office_telephone, "mobile": r.mobile, "fax": r.fax, "email": r.email,
            "pan": r.pan, "occupation_designation": r.occupation_designation,
            "introducing_member_name": r.introducing_member_name, "introducing_member_mobile": r.introducing_member_mobile,
            "member_photo": r.member_photo, "spouse_photo": r.spouse_photo,
            "pan_document": r.pan_document, "aadhaar_document": r.aadhaar_document,
            "payment_method": r.payment_method, "cheque_dd_number": r.cheque_dd_number,
            "payment_date": r.payment_date, "bank_drawn_on": r.bank_drawn_on,
            "amount_in_words": r.amount_in_words, "transaction_ref": r.transaction_ref,
            "place": r.place, "member_signature": r.member_signature, "terms_accepted": bool(r.terms_accepted),
            "razorpay_order_id": r.razorpay_order_id, "razorpay_payment_id": r.razorpay_payment_id,
            "payment_status": r.payment_status, "status": r.status, "created_at": r.created_at,
        }
        for r in rows
    ]


@router.get("/dainik", dependencies=[Depends(require_admin)])
def list_dainik(db: Session = Depends(get_db)):
    rows = db.query(DainikSewaForm).order_by(DainikSewaForm.created_at.desc()).limit(500).all()
    return [
        {
            "id": r.id, "name": r.name, "gotra": r.gotra, "father_name": r.father_name,
            "spouse_name": r.spouse_name, "office_address": r.office_address,
            "residence_address": r.residence_address, "email": r.email,
            "office_telephone": r.office_telephone, "residence_telephone": r.residence_telephone,
            "mobile": r.mobile, "self_profession": r.self_profession, "spouse_profession": r.spouse_profession,
            "self_dob": r.self_dob, "spouse_dob": r.spouse_dob, "marriage_anniversary": r.marriage_anniversary,
            "child1_name": r.child1_name, "child1_birthday": r.child1_birthday,
            "child2_name": r.child2_name, "child2_birthday": r.child2_birthday,
            "child3_name": r.child3_name, "child3_birthday": r.child3_birthday,
            "self_blood_group": r.self_blood_group, "spouse_blood_group": r.spouse_blood_group,
            "temple_contribution": r.temple_contribution, "photo": r.photo, "consent": bool(r.consent),
            "applicant_signature": r.applicant_signature, "one_time_amount": float(r.one_time_amount),
            "payment_method": r.payment_method, "cheque_dd_number": r.cheque_dd_number,
            "payment_date": r.payment_date, "bank_drawn_on": r.bank_drawn_on,
            "amount_in_words": r.amount_in_words, "transaction_ref": r.transaction_ref,
            "recurring_consent": bool(r.recurring_consent), "auto_payment_consent": bool(r.auto_payment_consent),
            "recurring_payment_method": r.recurring_payment_method, "recurring_start_date": r.recurring_start_date,
            "recurring_ref_id": r.recurring_ref_id, "place": r.place,
            "razorpay_order_id": r.razorpay_order_id, "razorpay_payment_id": r.razorpay_payment_id,
            "razorpay_subscription_id": r.razorpay_subscription_id,
            "subscription_payment_id": r.subscription_payment_id, "payment_status": r.payment_status,
            "status": r.status, "created_at": r.created_at,
        }
        for r in rows
    ]
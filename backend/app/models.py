import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Boolean, DateTime, Enum, Numeric, LargeBinary
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class DonationStatus(str, enum.Enum):
    created = "created"   # donor filled the form, Razorpay order created, payment not yet done
    paid = "paid"         # confirmed ONLY by verified webhook
    failed = "failed"
    refunded = "refunded"


class FormStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    closed = "closed"


class Donation(Base):
    """
    Donor details are captured and stored the moment the donor submits the
    pre-payment form — this is intentional (temple wants a record even if
    payment fails/abandons). Payment status is only ever flipped to `paid`
    by the verified Razorpay webhook handler, never by the frontend.
    """
    __tablename__ = "donations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)

    donor_name: Mapped[str] = mapped_column(String(120))
    donor_phone: Mapped[str] = mapped_column(String(20))
    donor_email: Mapped[str] = mapped_column(String(255))
    donor_pan: Mapped[str | None] = mapped_column(String(10), nullable=True)  # for 80G receipt
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    cause: Mapped[str] = mapped_column(String(80))  # e.g. "general", "annadaan", "rath_yatra"
    amount: Mapped[float] = mapped_column(Numeric(10, 2))

    razorpay_order_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    status: Mapped[DonationStatus] = mapped_column(Enum(DonationStatus), default=DonationStatus.created)

    receipt_number: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    receipt_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class MembershipForm(Base):
    __tablename__ = "membership_forms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    full_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(20))
    email: Mapped[str] = mapped_column(String(255))
    address: Mapped[str] = mapped_column(Text)
    occupation: Mapped[str | None] = mapped_column(String(120), nullable=True)
    family_members: Mapped[int | None] = mapped_column(nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[FormStatus] = mapped_column(Enum(FormStatus), default=FormStatus.new)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class SevaForm(Base):
    __tablename__ = "seva_forms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    full_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(20))
    email: Mapped[str] = mapped_column(String(255))
    seva_type: Mapped[str] = mapped_column(String(120))
    preferred_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[FormStatus] = mapped_column(Enum(FormStatus), default=FormStatus.new)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class SocietyMembershipForm(Base):
    """Form 1 — Society Membership. Amount is fixed per selected membership
    type; payment is captured via Razorpay. Photos / documents are stored as
    filenames (UUID, produced by /api/uploads) on the server — not publicly
    served, only admin-downloadable."""
    __tablename__ = "society_membership_forms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)

    membership_type: Mapped[str] = mapped_column(String(40))  # partner/founder/life/general/advisor
    membership_amount: Mapped[float] = mapped_column(Numeric(10, 2))

    name: Mapped[str] = mapped_column(String(120))
    father_husband_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    gotra: Mapped[str | None] = mapped_column(String(120), nullable=True)
    dob: Mapped[str | None] = mapped_column(String(20), nullable=True)
    blood_group: Mapped[str | None] = mapped_column(String(20), nullable=True)

    residence_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    office_address: Mapped[str | None] = mapped_column(Text, nullable=True)

    residence_telephone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    office_telephone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    mobile: Mapped[str] = mapped_column(String(20))
    fax: Mapped[str | None] = mapped_column(String(30), nullable=True)
    email: Mapped[str] = mapped_column(String(255))

    pan: Mapped[str | None] = mapped_column(String(10), nullable=True)
    aadhaar: Mapped[str | None] = mapped_column(String(20), nullable=True)
    occupation_designation: Mapped[str | None] = mapped_column(String(160), nullable=True)

    introducing_member_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    introducing_member_mobile: Mapped[str | None] = mapped_column(String(20), nullable=True)

    member_photo: Mapped[str | None] = mapped_column(String(120), nullable=True)  # UUID filename
    spouse_photo: Mapped[str | None] = mapped_column(String(120), nullable=True)
    pan_document: Mapped[str | None] = mapped_column(String(120), nullable=True)
    aadhaar_document: Mapped[str | None] = mapped_column(String(120), nullable=True)

    payment_method: Mapped[str | None] = mapped_column(String(40), default="online")
    cheque_dd_number: Mapped[str | None] = mapped_column(String(80), nullable=True)
    payment_date: Mapped[str | None] = mapped_column(String(40), nullable=True)
    bank_drawn_on: Mapped[str | None] = mapped_column(String(160), nullable=True)
    amount_in_words: Mapped[str | None] = mapped_column(String(255), nullable=True)
    transaction_ref: Mapped[str | None] = mapped_column(String(160), nullable=True)

    place: Mapped[str | None] = mapped_column(String(160), nullable=True)
    member_signature: Mapped[str | None] = mapped_column(String(160), nullable=True)
    terms_accepted: Mapped[bool] = mapped_column(Boolean, default=False)

    razorpay_order_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    payment_status: Mapped[str] = mapped_column(String(20), default="created")  # created/paid/failed
    status: Mapped[FormStatus] = mapped_column(Enum(FormStatus), default=FormStatus.new)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class DainikSewaForm(Base):
    """Form 2 — Dainik Sewa Membership. One-time ₹2,100 via Razorpay order plus
    an optional ₹200/month recurring auto-debit via a Razorpay subscription."""
    __tablename__ = "dainik_sewa_forms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)

    name: Mapped[str] = mapped_column(String(120))
    gotra: Mapped[str | None] = mapped_column(String(120), nullable=True)
    father_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    spouse_name: Mapped[str | None] = mapped_column(String(120), nullable=True)

    office_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    residence_address: Mapped[str | None] = mapped_column(Text, nullable=True)

    email: Mapped[str] = mapped_column(String(255))
    office_telephone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    residence_telephone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    mobile: Mapped[str] = mapped_column(String(20))

    self_profession: Mapped[str | None] = mapped_column(String(160), nullable=True)
    spouse_profession: Mapped[str | None] = mapped_column(String(160), nullable=True)
    self_dob: Mapped[str | None] = mapped_column(String(20), nullable=True)
    spouse_dob: Mapped[str | None] = mapped_column(String(20), nullable=True)
    marriage_anniversary: Mapped[str | None] = mapped_column(String(20), nullable=True)

    child1_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    child1_birthday: Mapped[str | None] = mapped_column(String(20), nullable=True)
    child2_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    child2_birthday: Mapped[str | None] = mapped_column(String(20), nullable=True)
    child3_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    child3_birthday: Mapped[str | None] = mapped_column(String(20), nullable=True)

    self_blood_group: Mapped[str | None] = mapped_column(String(20), nullable=True)
    spouse_blood_group: Mapped[str | None] = mapped_column(String(20), nullable=True)

    pan: Mapped[str | None] = mapped_column(String(10), nullable=True)
    aadhaar: Mapped[str | None] = mapped_column(String(20), nullable=True)

    temple_contribution: Mapped[str | None] = mapped_column(Text, nullable=True)

    photo: Mapped[str | None] = mapped_column(String(120), nullable=True)  # UUID filename
    consent: Mapped[bool] = mapped_column(Boolean, default=False)
    applicant_signature: Mapped[str | None] = mapped_column(String(160), nullable=True)

    # One-time membership payment
    one_time_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=2100)
    payment_method: Mapped[str | None] = mapped_column(String(40), default="online")
    cheque_dd_number: Mapped[str | None] = mapped_column(String(80), nullable=True)
    payment_date: Mapped[str | None] = mapped_column(String(40), nullable=True)
    bank_drawn_on: Mapped[str | None] = mapped_column(String(160), nullable=True)
    amount_in_words: Mapped[str | None] = mapped_column(String(255), nullable=True)
    transaction_ref: Mapped[str | None] = mapped_column(String(160), nullable=True)

    # Recurring Dainik Sewa payment
    recurring_consent: Mapped[bool] = mapped_column(Boolean, default=False)
    auto_payment_consent: Mapped[bool] = mapped_column(Boolean, default=False)
    recurring_payment_method: Mapped[str | None] = mapped_column(String(40), nullable=True)
    recurring_start_date: Mapped[str | None] = mapped_column(String(40), nullable=True)
    recurring_ref_id: Mapped[str | None] = mapped_column(String(160), nullable=True)

    place: Mapped[str | None] = mapped_column(String(160), nullable=True)

    razorpay_order_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    razorpay_subscription_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    subscription_payment_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    payment_status: Mapped[str] = mapped_column(String(20), default="created")  # created/paid/failed/subscribed
    status: Mapped[FormStatus] = mapped_column(Enum(FormStatus), default=FormStatus.new)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    excerpt: Mapped[str | None] = mapped_column(String(400), nullable=True)
    content: Mapped[str] = mapped_column(Text)
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(200))
    image_url: Mapped[str] = mapped_column(String(500))
    category: Mapped[str] = mapped_column(String(80), default="general")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class ProcessedWebhookEvent(Base):
    """Idempotency guard for Razorpay webhooks — one row per event id.

    The webhook handler inserts this row before processing. If the row
    already exists (duplicate delivery), the event is skipped. Prevents
    double-marking payments and double-sending receipts when Razorpay
    retries a webhook whose response it never saw.
    """
    __tablename__ = "processed_webhook_events"

    event_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class UploadedFile(Base):
    """Stored photo / document for the membership forms.

    File bytes live in the database (bytea in Postgres/Supabase, blob in
    SQLite) so uploads survive container restarts / horizontal scaling and are
    never served from the public origin — only via the admin endpoint.
    """
    __tablename__ = "uploaded_files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    stored_name: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    file_data: Mapped[bytes] = mapped_column(LargeBinary)
    content_type: Mapped[str] = mapped_column(String(80), default="application/octet-stream")
    size_bytes: Mapped[int] = mapped_column()
    original_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class PublicFile(Base):
    """File that IS meant to be served publicly (gallery photos, government
    documents/PDFs). Kept separate from UploadedFile (membership ID proofs,
    which stay admin-only). Same storage pattern: bytes in the DB."""
    __tablename__ = "public_files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    stored_name: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    file_data: Mapped[bytes] = mapped_column(LargeBinary)
    content_type: Mapped[str] = mapped_column(String(80), default="application/octet-stream")
    size_bytes: Mapped[int] = mapped_column()
    original_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Announcement(Base):
    """Home-page announcement managed from the admin panel."""
    __tablename__ = "announcements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Document(Base):
    """Government/trust documents (PDFs) uploaded from the admin panel and
    shown on the public Documents page. File bytes live in PublicFile."""
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(80), default="general")
    file_name: Mapped[str] = mapped_column(String(64), unique=True)  # PublicFile.stored_name
    original_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class SiteSetting(Base):
    """Key/value admin-editable site settings: live stream, aarti timings,
    festival calendar, under-construction banner text, etc."""
    __tablename__ = "site_settings"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

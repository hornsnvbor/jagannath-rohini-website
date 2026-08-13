import re
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

PHONE_RE = re.compile(r"^[6-9]\d{9}$")  # Indian mobile numbers
PAN_RE = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]$")


class DonationCreate(BaseModel):
    donor_name: str = Field(min_length=2, max_length=120)
    donor_phone: str
    donor_email: EmailStr
    donor_pan: str | None = None
    address: str | None = Field(default=None, max_length=500)
    cause: str = Field(pattern=r"^(general|annadaan|rath_yatra|seva|annaprasad)$")
    amount: float = Field(gt=0, le=1_000_000)  # sanity cap; adjust as needed

    @field_validator("donor_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v

    @field_validator("donor_pan")
    @classmethod
    def validate_pan(cls, v: str | None) -> str | None:
        if v in (None, ""):
            return None
        v = v.strip().upper()
        if not PAN_RE.match(v):
            raise ValueError("Enter a valid PAN (e.g. ABCDE1234F)")
        return v


class DonationOut(BaseModel):
    id: str
    razorpay_order_id: str | None
    amount: float
    status: str

    class Config:
        from_attributes = True


class RazorpayVerify(BaseModel):
    donation_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class MembershipCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str
    email: EmailStr
    address: str = Field(min_length=5, max_length=500)
    occupation: str | None = Field(default=None, max_length=120)
    family_members: int | None = Field(default=None, ge=0, le=50)
    message: str | None = Field(default=None, max_length=1000)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v


class SevaCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str
    email: EmailStr
    seva_type: str = Field(min_length=2, max_length=120)
    preferred_date: str | None = None
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v


class BlogPostOut(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str | None
    content: str
    cover_image: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class BlogPostCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    slug: str = Field(pattern=r"^[a-z0-9-]{3,220}$")
    excerpt: str | None = Field(default=None, max_length=400)
    content: str = Field(min_length=10)
    cover_image: str | None = None
    published: bool = False


class GalleryItemOut(BaseModel):
    id: str
    title: str
    image_url: str
    category: str

    class Config:
        from_attributes = True


class GalleryItemCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    image_url: str = Field(max_length=500)
    category: str = Field(default="general", max_length=80)


class AdminLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

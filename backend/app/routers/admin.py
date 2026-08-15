from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MembershipForm, SevaForm, UploadedFile
from app.schemas import MembershipCreate, SevaCreate
from app.security import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/members")
def list_members(db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    """Display all (simple) membership form submissions."""
    rows = db.query(MembershipForm).order_by(MembershipForm.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "full_name": r.full_name,
            "phone": r.phone,
            "email": r.email,
            "address": r.address,
            "occupation": r.occupation,
            "family_members": r.family_members,
            "message": r.message,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.get("/seva")
def list_seva(db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    """Display all seva form submissions."""
    rows = db.query(SevaForm).order_by(SevaForm.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "gotra": r.gotra,
            "father_name": r.father_name,
            "spouse_name": r.spouse_name,
            "office_address": r.office_address,
            "residence_address": r.residence_address,
            "email": r.email,
            "office_telephone": r.office_telephone,
            "residence_telephone": r.residence_telephone,
            "mobile": r.mobile,
            "self_profession": r.self_profession,
            "spouse_profession": r.spouse_profession,
            "self_dob": r.self_dob,
            "spouse_dob": r.spouse_dob,
            "marriage_anniversary": str(r.marriage_anniversary) if r.marriage_anniversary else None,
            "child1_name": r.child1_name,
            "child1_birthday": r.child1_birthday.isoformat() if r.child1_birthday else None,
            "child2_name": r.child2_name,
            "child2_birthday": r.child2_birthday.isoformat() if r.child2_birthday else None,
            "child3_name": r.child3_name,
            "child3_birthday": r.child3_birthday.isoformat() if r.child3_birthday else None,
            "self_blood_group": r.self_blood_group,
            "spouse_blood_group": r.spouse_blood_group,
            "temple_contribution": r.temple_contribution,
            "photo": r.photo,
            "consent": r.consent,
            "applicant_signature": r.applicant_signature,
            "payment_method": r.payment_method,
            "recurring_consent": r.recurring_consent,
            "auto_payment_consent": r.auto_payment_consent,
            "recurring_payment_method": r.recurring_payment_method,
            "recurring_start_date": r.recurring_start_date,
            "place": r.place,
            "amount_in_words": r.amount_in_words,
            "recurring": r.recurring_consent,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.get("/uploads")
def list_uploads(db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    """Display all uploaded files/docs."""
    rows = db.query(UploadedFile).order_by(UploadedFile.created_at.desc()).all()
    return [
        {
            "id": row.id,
            "stored_name": row.stored_name,
            "original_name": row.original_name,
            "content_type": row.content_type,
            "size_bytes": row.size_bytes,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]
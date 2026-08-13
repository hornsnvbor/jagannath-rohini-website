from fastapi import APIRouter, Depends, Request, status
from app.limiter import limiter
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import MembershipForm, SevaForm
from app.schemas import MembershipCreate, SevaCreate
from app.security import require_admin

router = APIRouter(prefix="/api/forms", tags=["forms"])


@router.post("/membership", status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_FORMS)
def submit_membership(request: Request, payload: MembershipCreate, db: Session = Depends(get_db)):
    entry = MembershipForm(**payload.model_dump())
    db.add(entry)
    db.commit()
    if settings.SMTP_FROM:
        from starlette.background import BackgroundTask
        from fastapi.responses import JSONResponse
        from app.utils.notify import send_form_confirmation

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"message": "Membership request received. The committee will contact you soon.", "id": entry.id},
            background=BackgroundTask(send_form_confirmation, "Membership", entry.email, entry.full_name),
        )
    return {"message": "Membership request received. The committee will contact you soon.", "id": entry.id}


@router.post("/seva", status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_FORMS)
def submit_seva(request: Request, payload: SevaCreate, db: Session = Depends(get_db)):
    entry = SevaForm(**payload.model_dump())
    db.add(entry)
    db.commit()
    if settings.SMTP_FROM:
        from starlette.background import BackgroundTask
        from fastapi.responses import JSONResponse
        from app.utils.notify import send_form_confirmation

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"message": "Seva request received. We'll reach out to confirm details.", "id": entry.id},
            background=BackgroundTask(send_form_confirmation, "Seva", entry.email, entry.full_name),
        )
    return {"message": "Seva request received. We'll reach out to confirm details.", "id": entry.id}


@router.get("/membership", dependencies=[Depends(require_admin)])
def list_membership(db: Session = Depends(get_db)):
    rows = db.query(MembershipForm).order_by(MembershipForm.created_at.desc()).all()
    return [
        {
            "id": r.id, "full_name": r.full_name, "phone": r.phone, "email": r.email,
            "address": r.address, "occupation": r.occupation, "family_members": r.family_members,
            "message": r.message, "status": r.status, "created_at": r.created_at,
        }
        for r in rows
    ]


@router.get("/seva", dependencies=[Depends(require_admin)])
def list_seva(db: Session = Depends(get_db)):
    rows = db.query(SevaForm).order_by(SevaForm.created_at.desc()).all()
    return [
        {
            "id": r.id, "full_name": r.full_name, "phone": r.phone, "email": r.email,
            "seva_type": r.seva_type, "preferred_date": r.preferred_date, "notes": r.notes,
            "status": r.status, "created_at": r.created_at,
        }
        for r in rows
    ]

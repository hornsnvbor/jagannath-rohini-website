import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.limiter import limiter
from app.models import UploadedFile
from app.security import require_admin
from app.utils.uploads import inspect_upload

router = APIRouter(tags=["uploads"])

ALLOWED_NAME = re.compile(r"[A-Za-z0-9]+\.[A-Za-z0-9]+")


@router.post("/api/uploads", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def upload_file(request: Request, file: UploadFile, db: Session = Depends(get_db)):
    """Accept a single photo/document. Validates magic bytes, renames to a
    random UUID, stores bytes in the DATABASE (Supabase/Postgres in prod).
    Returns the stored filename (referenced from the membership form
    submission). Files are never served publicly."""
    content, ext, content_type = inspect_upload(file)
    stored = f"{uuid.uuid4().hex}.{ext}"
    original = file.filename or ""
    safe_original = re.sub(r"[^A-Za-z0-9._-]", "_", original)[:100] or None
    db.add(
        UploadedFile(
            stored_name=stored,
            file_data=content,
            content_type=content_type,
            size_bytes=len(content),
            original_name=safe_original,
        )
    )
    db.commit()
    return {"filename": stored}


@router.get("/api/uploads/{filename}")
def download_upload(filename: str, admin: str = Depends(require_admin), db: Session = Depends(get_db)):
    """Admin-authenticated download of a stored upload. Guards against path
    traversal so only files actually stored for this app can be fetched."""
    if not ALLOWED_NAME.match(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")
    row = db.query(UploadedFile).filter(UploadedFile.stored_name == filename).first()
    if not row:
        raise HTTPException(status_code=404, detail="File not found")
    return Response(content=row.file_data, media_type=row.content_type, headers={"Content-Disposition": f'inline; filename="{filename}"'})
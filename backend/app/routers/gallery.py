from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GalleryItem
from app.schemas import GalleryItemCreate, GalleryItemOut
from app.security import require_admin

router = APIRouter(prefix="/api/gallery", tags=["gallery"])


@router.get("", response_model=list[GalleryItemOut])
def list_items(db: Session = Depends(get_db)):
    return db.query(GalleryItem).order_by(GalleryItem.created_at.desc()).limit(200).all()


@router.post("", response_model=GalleryItemOut, dependencies=[Depends(require_admin)])
def add_item(payload: GalleryItemCreate, db: Session = Depends(get_db)):
    item = GalleryItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", dependencies=[Depends(require_admin)])
def delete_item(item_id: str, db: Session = Depends(get_db)):
    item = db.get(GalleryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BlogPost
from app.schemas import BlogPostCreate, BlogPostOut
from app.security import require_admin

router = APIRouter(prefix="/api/blog", tags=["blog"])


@router.get("", response_model=list[BlogPostOut])
def list_posts(db: Session = Depends(get_db)):
    return db.query(BlogPost).filter(BlogPost.published.is_(True)).order_by(BlogPost.created_at.desc()).all()


@router.get("/{slug}", response_model=BlogPostOut)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.published.is_(True)).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=BlogPostOut, dependencies=[Depends(require_admin)])
def create_post(payload: BlogPostCreate, db: Session = Depends(get_db)):
    existing = db.query(BlogPost).filter(BlogPost.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=409, detail="Slug already exists")
    post = BlogPost(**payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=BlogPostOut, dependencies=[Depends(require_admin)])
def update_post(post_id: str, payload: BlogPostCreate, db: Session = Depends(get_db)):
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    existing = (
        db.query(BlogPost)
        .filter(BlogPost.slug == payload.slug, BlogPost.id != post_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Slug already exists")
    for key, value in payload.model_dump().items():
        setattr(post, key, value)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", dependencies=[Depends(require_admin)])
def delete_post(post_id: str, db: Session = Depends(get_db)):
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Deleted"}

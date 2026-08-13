from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# Lightweight, additive schema sync. `Base.metadata.create_all` only creates
# tables that don't exist yet — it never adds columns to existing tables, so
# we explicitly add any new columns here for already-deployed databases.
# (Google-style ALTER for small datasets; fine for a temple site.)
_ADDITIVE_MIGRATIONS = (
    (
        "donations",
        "receipt_number",
        "VARCHAR(80)",
    ),
)


def ensure_schema() -> None:
    """Run after create_all: add missing columns required by the current models."""
    inspector = inspect(engine)
    with engine.begin() as conn:
        for table, column, col_type in _ADDITIVE_MIGRATIONS:
            try:
                columns = {c["name"] for c in inspector.get_columns(table)}
            except Exception:
                continue  # table doesn't exist yet — create_all already handled it
            if column not in columns:
                conn.execute(text(f'ALTER TABLE "{table}" ADD COLUMN "{column}" {col_type}'))


def get_db():
    """FastAPI dependency — one DB session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

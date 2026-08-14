"""
Photo / document uploads for the membership forms.

Files are stored as bytea rows in the DATABASE (Postgres via Supabase in
production, SQLite locally) — never on the app's local disk, which is
ephemeral on Render/Docker. This lets the same uploaded file be served by any
backend instance.

Security notes (per AGENTS.md):
- File type is validated by reading MAGIC BYTES, never the filename extension.
- Files are renamed to random UUIDs server-side.
- Uploaded files are NOT served from the app origin publicly — they are only
  downloadable through an admin-authenticated endpoint.
- A size cap (MAX_UPLOAD_BYTES) applies before any bytes are stored.
"""
from fastapi import HTTPException, UploadFile

from app.config import settings

# Header bytes every supported type must start with.
_MAGIC: list[tuple[str, bytes, str]] = [
    ("pdf", b"%PDF", "pdf"),                                   # application/pdf
    ("jpeg", b"\xff\xd8\xff", "jpg"),                          # image/jpeg
    ("png", b"\x89PNG\r\n\x1a\n", "png"),                      # image/png
    ("gif", b"GIF87a", "gif"),                                 # image/gif
    ("gif", b"GIF89a", "gif"),                                 # image/gif
    ("webp", b"RIFF", "webp"),                                 # image/webp (checked below)
]

_CONTENT_TYPES = {
    "jpg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "pdf": "application/pdf",
}

_WEBP_SUFFIX = b"WEBP"


def _detect(bytes_: bytes) -> str | None:
    """Return the file extension for a supported file type, else None."""
    for _label, magic, ext in _MAGIC:
        if bytes_.startswith(magic):
            if ext == "webp":
                if len(bytes_) >= 12 and bytes_[8:12] == _WEBP_SUFFIX:
                    return ext
                continue
            return ext
    return None


def inspect_upload(file: UploadFile) -> tuple[bytes, str, str]:
    """Validate an uploaded file. Returns (content, ext, content_type).

    Raises HTTPException(400) for unsupported types / oversized files, and
    HTTPException(413) when the body exceeds the cap. The caller persists the
    returned bytes to the database.
    """
    if settings.MAX_UPLOAD_BYTES <= 0:
        raise HTTPException(status_code=413, detail="File uploads are disabled")

    contents = file.file.read(settings.MAX_UPLOAD_BYTES + 1)
    if len(contents) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5 MB.")

    ext = _detect(contents)
    if ext is None:
        raise HTTPException(status_code=400, detail="Unsupported file type. Upload JPG, PNG, GIF, WEBP or PDF only.")

    return contents, ext, _CONTENT_TYPES[ext]
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.limiter import limiter

from app.config import settings
from app.database import Base, engine, ensure_schema
from app.routers import auth, blog, config, donations, forms, gallery, live

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Boot checklist — fail loud with a helpful message instead of a mystery 500.
    missing = settings.validate_ready()
    if missing:
        message = (
            "Missing required configuration: " + ", ".join(missing)
            + ". Copy backend/.env.example to backend/.env and fill in real values."
        )
        if settings.is_production:
            raise RuntimeError(message)
        logger.warning(message)

    Base.metadata.create_all(bind=engine)
    ensure_schema()
    yield


app = FastAPI(
    title="Jagannath Mandir Rohini API",
    lifespan=lifespan,
    docs_url="/api/docs" if not settings.is_production else None,  # hide Swagger in prod
    redoc_url=None,
)

limiter.default_limits = [settings.RATE_LIMIT_DEFAULT]
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — only exact origins from env, never "*". Credentials off since we use
# Bearer tokens (in headers), not cookies.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = settings.CSP
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never leak stack traces / internals to the client — log server-side only.
    logger.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})


app.include_router(config.router)
app.include_router(auth.router)
app.include_router(donations.router)
app.include_router(forms.router)
app.include_router(blog.router)
app.include_router(gallery.router)
app.include_router(live.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---- Optional: serve the built frontend (single-container / Docker deploy) ----
# When FRONTEND_DIST points at the Vite build output, the same FastAPI process
# serves the SPA plus the API. Enabled only if the directory actually exists,
# so local dev (Vite on :5173) is unaffected.

_dist = settings.frontend_dist_dir

if _dist is not None:
    assets_dir = _dist / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_index():
        return FileResponse(_dist / "index.html")

    @app.get("/{path:path}")
    async def spa_fallback(path: str):
        if path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        candidate = _dist / path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(_dist / "index.html")
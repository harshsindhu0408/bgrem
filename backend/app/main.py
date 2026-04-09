"""
FastAPI application entry point.

Startup sequence:
  1. Import processor module → triggers model pre-load
  2. CORS middleware configured for dev (localhost:5173)
  3. Routes mounted at /api
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load the rembg model during startup so the first request isn't slow.
    # The import itself triggers new_session() in processor.py.
    import app.services.processor  # noqa: F401
    yield
    # Cleanup (thread pool shutdown) on shutdown
    from app.routes.remove_bg import _EXECUTOR
    _EXECUTOR.shutdown(wait=False)


application = FastAPI(
    title="BG Remover API",
    description="Remove image backgrounds and replace with pure white.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
application.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4173",
        "https://bgrem.sindhustudio.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
from app.routes.remove_bg import router as bg_router  # noqa: E402

application.include_router(bg_router, prefix="/api")


@application.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "bg-remover"}

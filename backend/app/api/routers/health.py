from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/api")
def api_index():
    return {
        "status": "ok",
        "service": "CiteIQ API",
        "docs": "/docs",
        "health": "/health",
    }

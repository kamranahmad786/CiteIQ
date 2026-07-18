from fastapi import APIRouter, Depends

from app.api.deps import require_permission

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics/usage")
def usage(_user=Depends(require_permission("analytics:view"))):
    return {
        "active_users": 24,
        "documents_indexed": 4,
        "questions_answered": 128,
        "abstention_rate": 0.07,
        "p95_answer_latency_ms": 840,
    }


@router.get("/audit-logs")
def audit_logs(_user=Depends(require_permission("admin:view"))):
    return [
        {"actor": "admin@citeiq.test", "action": "document.uploaded", "entity": "Leave Policy 2026"},
        {"actor": "admin@citeiq.test", "action": "chat.answered", "entity": "default-session"},
    ]

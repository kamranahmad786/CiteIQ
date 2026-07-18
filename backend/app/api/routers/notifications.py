import asyncio
import json
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.api import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


NOTIFICATIONS: list[dict[str, object]] = [
    {
        "id": "notif-citation-coverage",
        "title": "Citation coverage healthy",
        "detail": "96% cited answer coverage across 4 spaces",
        "level": "Ready",
        "category": "Quality",
        "created_at": now_iso(),
        "read": False,
        "action_view": "analytics",
    },
    {
        "id": "notif-retention-review",
        "title": "Retention review pending",
        "detail": "Vendor Contract Template review is due soon",
        "level": "Watch",
        "category": "Governance",
        "created_at": now_iso(),
        "read": False,
        "action_view": "documents",
    },
    {
        "id": "notif-role-sync",
        "title": "Role sync available",
        "detail": "Admin roles can be refreshed from workspace policy",
        "level": "Action",
        "category": "Admin",
        "created_at": now_iso(),
        "read": False,
        "action_view": "admin",
    },
]

LIVE_NOTIFICATION_TEMPLATES = [
    ("New indexed document signal", "Document ingestion pipeline completed a fresh readiness scan", "Ready", "Ingestion", "documents"),
    ("Answer quality drift check", "Retrieval quality monitor found 2 prompts that need review", "Watch", "Quality", "analytics"),
    ("Support SLA update", "One support case moved to priority review", "Action", "Support", "support"),
    ("Vector index heartbeat", "pgvector HNSW index is responding within target latency", "Ready", "Vector", "vector-index"),
]


def serialize(item: dict[str, object]) -> NotificationResponse:
    return NotificationResponse(**item)


@router.get("", response_model=list[NotificationResponse])
def list_notifications():
    return [serialize(item) for item in NOTIFICATIONS]


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(notification_id: str):
    for item in NOTIFICATIONS:
        if item["id"] == notification_id:
            item["read"] = True
            return serialize(item)
    raise HTTPException(status_code=404, detail="Notification not found")


@router.delete("/{notification_id}")
def delete_notification(notification_id: str):
    for index, item in enumerate(NOTIFICATIONS):
        if item["id"] == notification_id:
            NOTIFICATIONS.pop(index)
            return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Notification not found")


@router.delete("/read/clear")
def clear_read_notifications():
    unread = [item for item in NOTIFICATIONS if not item.get("read")]
    NOTIFICATIONS[:] = unread
    return {"status": "cleared", "remaining": len(NOTIFICATIONS)}


async def notification_event_stream():
    event_index = 0
    while True:
        await asyncio.sleep(12)
        title, detail, level, category, action_view = LIVE_NOTIFICATION_TEMPLATES[event_index % len(LIVE_NOTIFICATION_TEMPLATES)]
        event_index += 1
        item = {
            "id": f"notif-live-{uuid4()}",
            "title": title,
            "detail": detail,
            "level": level,
            "category": category,
            "created_at": now_iso(),
            "read": False,
            "action_view": action_view,
        }
        NOTIFICATIONS.insert(0, item)
        yield f"event: notification\ndata: {json.dumps(item)}\n\n"


@router.get("/stream")
async def stream_notifications():
    return StreamingResponse(notification_event_stream(), media_type="text/event-stream")

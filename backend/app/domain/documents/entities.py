from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import UUID, uuid4


@dataclass
class Document:
    title: str
    source_filename: str
    content: str
    space: str = "HR Policies"
    mime_type: str = "text/plain"
    id: UUID = field(default_factory=uuid4)
    version_id: UUID = field(default_factory=uuid4)
    status: str = "ready"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class DocumentChunk:
    document_id: UUID
    document_version_id: UUID
    document_title: str
    chunk_no: int
    content: str
    page_start: int = 1
    page_end: int = 1
    section: str | None = None
    embedding: list[float] = field(default_factory=list)
    id: UUID = field(default_factory=uuid4)


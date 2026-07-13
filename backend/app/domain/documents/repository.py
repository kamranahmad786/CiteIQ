from __future__ import annotations

from uuid import UUID

from app.domain.documents.entities import Document, DocumentChunk
from app.domain.ingestion.chunking import ChunkingService
from app.domain.retrieval.service import RetrievalService


class InMemoryDocumentRepository:
    def __init__(self):
        self.documents: list[Document] = []
        self.chunks: list[DocumentChunk] = []
        self.chunker = ChunkingService()
        self.retrieval = RetrievalService()

    def seed(self, documents: list[Document]) -> None:
        for document in documents:
            self.add(document)

    def add(self, document: Document) -> Document:
        self.documents.append(document)
        self.index(document)
        return document

    def index(self, document: Document) -> None:
        self.chunks = [chunk for chunk in self.chunks if chunk.document_id != document.id]
        text_chunks = self.chunker.chunk_text(document.content)
        new_chunks = [
            DocumentChunk(
                document_id=document.id,
                document_version_id=document.version_id,
                document_title=document.title,
                chunk_no=index + 1,
                content=chunk.content,
                page_start=chunk.page_start,
                page_end=chunk.page_end,
                section=chunk.section,
            )
            for index, chunk in enumerate(text_chunks)
        ]
        self.chunks.extend(self.retrieval.embed_chunks(new_chunks))

    def list(self) -> list[Document]:
        return self.documents

    def get(self, document_id: UUID) -> Document | None:
        return next((document for document in self.documents if document.id == document_id), None)

    def archive(self, document_id: UUID) -> Document | None:
        document = self.get(document_id)
        if document is None:
            return None
        document.status = "archived"
        self.chunks = [chunk for chunk in self.chunks if chunk.document_id != document_id]
        return document

    def unarchive(self, document_id: UUID) -> Document | None:
        document = self.get(document_id)
        if document is None:
            return None
        document.status = "ready"
        self.index(document)
        return document

    def search_chunks(self, question: str, top_k: int = 8):
        return self.retrieval.retrieve(question, self.chunks, top_k=top_k)

    def answer(self, question: str, top_k: int = 5):
        return self.retrieval.answer(question, self.chunks, top_k=top_k)

    def document_chunks(self, document_id: UUID) -> list[DocumentChunk]:
        return [chunk for chunk in self.chunks if chunk.document_id == document_id]

    def answer_document(self, document_id: UUID, question: str, top_k: int = 5):
        chunks = self.document_chunks(document_id)
        return self.retrieval.answer_document(question, chunks, top_k=top_k)

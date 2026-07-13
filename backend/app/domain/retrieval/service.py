from __future__ import annotations

from dataclasses import dataclass
import re

from app.domain.documents.entities import DocumentChunk
from app.domain.retrieval.providers import (
    EvidenceOnlyGenerationProvider,
    LocalHashEmbeddingProvider,
    RetrievedChunk,
    TOKEN_RE,
    cosine,
)


@dataclass(frozen=True)
class ChatAnswer:
    answer: str
    citations: list[RetrievedChunk]


class RetrievalService:
    def __init__(
        self,
        embedding_provider: LocalHashEmbeddingProvider | None = None,
        generation_provider: EvidenceOnlyGenerationProvider | None = None,
    ):
        self.embedding_provider = embedding_provider or LocalHashEmbeddingProvider()
        self.generation_provider = generation_provider or EvidenceOnlyGenerationProvider()

    def embed_chunks(self, chunks: list[DocumentChunk]) -> list[DocumentChunk]:
        for chunk in chunks:
            chunk.embedding = self.embedding_provider.embed(chunk.content)
        return chunks

    def retrieve(self, question: str, chunks: list[DocumentChunk], top_k: int = 8) -> list[RetrievedChunk]:
        query_embedding = self.embedding_provider.embed(question)
        query_terms = set(TOKEN_RE.findall(question.lower()))
        results: list[RetrievedChunk] = []
        for chunk in chunks:
            text_terms = set(TOKEN_RE.findall(chunk.content.lower()))
            lexical = len(query_terms & text_terms) / max(len(query_terms), 1)
            vector = cosine(query_embedding, chunk.embedding)
            score = (0.72 * vector) + (0.28 * lexical)
            results.append(
                RetrievedChunk(
                    chunk_id=str(chunk.id),
                    document_title=chunk.document_title,
                    page_start=chunk.page_start,
                    page_end=chunk.page_end,
                    content=chunk.content,
                    score=round(score, 4),
                    section=chunk.section,
                )
            )
        return sorted(results, key=lambda item: item.score, reverse=True)[:top_k]

    def answer(self, question: str, chunks: list[DocumentChunk], top_k: int = 5) -> ChatAnswer:
        evidence = self.retrieve(question, chunks, top_k=top_k)
        answer = self.generation_provider.answer(question, evidence)
        citations = [] if answer.startswith("I could not find") else [item for item in evidence[:3] if item.score >= 0.2]
        return ChatAnswer(answer=answer, citations=citations)

    def answer_document(self, question: str, chunks: list[DocumentChunk], top_k: int = 5) -> ChatAnswer:
        if not chunks:
            return ChatAnswer("I could not find this information in the authorised documents.", [])
        if self._is_document_summary_question(question):
            evidence = self._document_evidence(chunks, top_k=top_k)
            return ChatAnswer(self._summarise_document(evidence), evidence[:3])
        evidence = self.retrieve(question, chunks, top_k=top_k)
        answer = self.generation_provider.answer(question, evidence)
        if answer.startswith("I could not find") and self._mentions_document(question, chunks[0].document_title):
            evidence = self._document_evidence(chunks, top_k=top_k)
            return ChatAnswer(self._summarise_document(evidence), evidence[:3])
        citations = [] if answer.startswith("I could not find") else [item for item in evidence[:3] if item.score >= 0.12]
        return ChatAnswer(answer, citations)

    def _document_evidence(self, chunks: list[DocumentChunk], top_k: int) -> list[RetrievedChunk]:
        return [
            RetrievedChunk(
                chunk_id=str(chunk.id),
                document_title=chunk.document_title,
                page_start=chunk.page_start,
                page_end=chunk.page_end,
                content=chunk.content,
                score=1.0,
                section=chunk.section,
            )
            for chunk in chunks[:top_k]
        ]

    def _is_document_summary_question(self, question: str) -> bool:
        lowered = question.lower()
        return any(
            phrase in lowered
            for phrase in [
                "summarise",
                "summarize",
                "summary",
                "key point",
                "key points",
                "main detail",
                "main details",
                "action summary",
                "overview",
                "tell me about",
            ]
        )

    def _mentions_document(self, question: str, document_title: str) -> bool:
        question_terms = set(TOKEN_RE.findall(question.lower()))
        title_terms = set(TOKEN_RE.findall(document_title.lower()))
        return bool(question_terms & title_terms)

    def _summarise_document(self, evidence: list[RetrievedChunk]) -> str:
        combined = " ".join(item.content for item in evidence)
        sentences = [
            clean
            for clean in (sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", combined))
            if len(clean.split()) >= 5
        ]
        if not sentences:
            sentences = [combined.strip()]
        bullets = sentences[:4]
        document_title = evidence[0].document_title
        bullet_text = "\n".join(f"- {sentence}" for sentence in bullets)
        return f"Here is a grounded summary of {document_title}:\n{bullet_text}"

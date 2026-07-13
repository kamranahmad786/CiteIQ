from __future__ import annotations

import hashlib
import math
import re
from dataclasses import dataclass
from typing import Protocol


TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9']+")


class EmbeddingProvider(Protocol):
    dimensions: int

    def embed(self, text: str) -> list[float]:
        ...


class GenerationProvider(Protocol):
    def answer(self, question: str, evidence: list["RetrievedChunk"]) -> str:
        ...


@dataclass(frozen=True)
class RetrievedChunk:
    chunk_id: str
    document_title: str
    page_start: int
    page_end: int
    content: str
    score: float
    section: str | None = None


class LocalHashEmbeddingProvider:
    dimensions = 96

    def embed(self, text: str) -> list[float]:
        vector = [0.0] * self.dimensions
        for token in TOKEN_RE.findall(text.lower()):
            digest = hashlib.blake2b(token.encode("utf-8"), digest_size=4).digest()
            index = int.from_bytes(digest[:2], "big") % self.dimensions
            sign = 1.0 if digest[2] % 2 == 0 else -1.0
            vector[index] += sign
        norm = math.sqrt(sum(v * v for v in vector)) or 1.0
        return [v / norm for v in vector]


class EvidenceOnlyGenerationProvider:
    def answer(self, question: str, evidence: list[RetrievedChunk]) -> str:
        if not evidence or evidence[0].score < 0.35:
            return "I could not find this information in the authorised documents."
        sentences: list[str] = []
        question_terms = set(TOKEN_RE.findall(question.lower()))
        for item in evidence[:3]:
            for sentence in re.split(r"(?<=[.!?])\s+", item.content):
                words = set(TOKEN_RE.findall(sentence.lower()))
                if question_terms & words and len(sentence) > 24:
                    sentences.append(sentence.strip())
                    if len(sentences) >= 3:
                        break
            if len(sentences) >= 2:
                break
        if not sentences:
            sentences = [evidence[0].content.split("\n")[-1][:360].strip()]
        return " ".join(sentences)


def cosine(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    return sum(x * y for x, y in zip(a, b))

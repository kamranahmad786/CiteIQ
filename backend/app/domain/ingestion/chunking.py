from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class TextChunk:
    content: str
    section: str | None
    page_start: int
    page_end: int


class ChunkingService:
    def __init__(self, max_words: int = 140, overlap_words: int = 28):
        self.max_words = max_words
        self.overlap_words = overlap_words

    def chunk_text(self, raw: str, page_start: int = 1) -> list[TextChunk]:
        normalized = self._normalize(raw)
        sections = self._split_sections(normalized)
        chunks: list[TextChunk] = []
        for section, body in sections:
            words = body.split()
            if not words:
                continue
            if len(words) <= self.max_words:
                chunks.append(TextChunk(body.strip(), section, page_start, page_start))
                continue
            start = 0
            while start < len(words):
                end = min(start + self.max_words, len(words))
                text = " ".join(words[start:end]).strip()
                if section and not text.lower().startswith(section.lower()):
                    text = f"{section}\n{text}"
                chunks.append(TextChunk(text, section, page_start, page_start))
                if end == len(words):
                    break
                start = max(0, end - self.overlap_words)
        return chunks

    def _normalize(self, raw: str) -> str:
        text = raw.replace("\r\n", "\n").replace("\r", "\n")
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    def _split_sections(self, text: str) -> list[tuple[str | None, str]]:
        blocks = re.split(r"\n(?=(?:#{1,3}\s+|[A-Z][A-Za-z0-9 /&-]{2,80}\n))", text)
        sections: list[tuple[str | None, str]] = []
        for block in blocks:
            clean = block.strip()
            if not clean:
                continue
            lines = clean.splitlines()
            first = lines[0].lstrip("# ").strip()
            looks_like_heading = lines[0].startswith("#") or (
                len(lines) > 1 and len(first.split()) <= 10 and not first.endswith(".")
            )
            section = first if looks_like_heading else None
            sections.append((section, clean))
        return sections


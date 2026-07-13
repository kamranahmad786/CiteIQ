from app.domain.documents.repository import InMemoryDocumentRepository
from app.domain.documents.seed import SEED_DOCUMENTS
from app.domain.ingestion.chunking import ChunkingService


def test_chunker_preserves_section_headers():
    raw = "# Leave Policy\nEmployees receive 12 casual leave days.\n\n# Sick Leave\nEmployees receive 10 sick leave days."
    chunks = ChunkingService(max_words=12, overlap_words=2).chunk_text(raw)
    assert any("Leave Policy" in chunk.content for chunk in chunks)
    assert len(chunks) >= 2


def test_retrieval_returns_cited_leave_answer():
    repo = InMemoryDocumentRepository()
    repo.seed(SEED_DOCUMENTS)
    answer = repo.answer("How many casual leave days do employees receive?")
    assert "12 casual leave days" in answer.answer
    assert answer.citations
    assert answer.citations[0].document_title == "Leave Policy 2026"


def test_generation_abstains_without_evidence():
    repo = InMemoryDocumentRepository()
    repo.seed(SEED_DOCUMENTS)
    answer = repo.answer("What is the cafeteria sushi menu?")
    assert answer.answer.startswith("I could not find")


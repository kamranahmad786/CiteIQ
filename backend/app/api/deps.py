from app.domain.documents.repository import InMemoryDocumentRepository
from app.domain.documents.seed import SEED_DOCUMENTS


repository = InMemoryDocumentRepository()
repository.seed(SEED_DOCUMENTS)


def get_repository() -> InMemoryDocumentRepository:
    return repository


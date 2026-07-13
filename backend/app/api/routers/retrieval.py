from fastapi import APIRouter, Depends

from app.api.deps import get_repository
from app.domain.documents.repository import InMemoryDocumentRepository
from app.schemas.api import ChatQuestionRequest, CitationResponse

router = APIRouter(prefix="/retrieval", tags=["retrieval"])


@router.post("/search", response_model=list[CitationResponse])
def search(payload: ChatQuestionRequest, repo: InMemoryDocumentRepository = Depends(get_repository)):
    return repo.search_chunks(payload.question, top_k=payload.top_k)


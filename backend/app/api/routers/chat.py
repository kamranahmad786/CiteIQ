from fastapi import APIRouter, Depends

from app.api.deps import get_repository
from app.api.routers.documents import get_document_or_404
from app.domain.documents.repository import InMemoryDocumentRepository
from app.schemas.api import ChatAnswerResponse, ChatQuestionRequest

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/sessions/default/messages", response_model=ChatAnswerResponse)
def ask_question(payload: ChatQuestionRequest, repo: InMemoryDocumentRepository = Depends(get_repository)):
    if payload.document_id:
        document = get_document_or_404(payload.document_id, repo)
        answer = repo.answer_document(document.id, payload.question, top_k=payload.top_k)
    else:
        answer = repo.answer(payload.question, top_k=payload.top_k)
    return ChatAnswerResponse(answer=answer.answer, citations=answer.citations)

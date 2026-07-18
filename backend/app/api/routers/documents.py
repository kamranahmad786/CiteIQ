from io import BytesIO
import re
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from pypdf import PdfReader

from app.api.deps import get_repository, require_permission
from app.domain.documents.entities import Document
from app.domain.documents.repository import InMemoryDocumentRepository
from app.schemas.api import DocumentResponse, DocumentVersionResponse, UploadDocumentRequest

router = APIRouter(prefix="/documents", tags=["documents"])


def clean_extracted_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def extract_literal_pdf_strings(file_bytes: bytes) -> str:
    raw = file_bytes.decode("latin-1", errors="ignore")
    literal_strings = re.findall(r"\((?:\\.|[^\\()]){4,}\)", raw)
    cleaned_strings = []
    for value in literal_strings:
        text = value[1:-1]
        text = text.replace(r"\(", "(").replace(r"\)", ")").replace(r"\\", "\\")
        text = text.replace(r"\n", " ").replace(r"\r", " ").replace(r"\t", " ")
        clean_text = clean_extracted_text(text)
        if clean_text and any(character.isalpha() for character in clean_text):
            cleaned_strings.append(clean_text)
    return "\n".join(cleaned_strings)


def extract_pdf_text(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(file_bytes))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not read this PDF file") from exc

    page_text: list[str] = []
    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if not text.strip():
            try:
                text = page.extract_text(extraction_mode="layout") or ""
            except TypeError:
                text = ""
        clean_text = clean_extracted_text(text)
        if clean_text:
            page_text.append(f"# Page {page_number}\n{clean_text}")

    extracted_text = "\n\n".join(page_text).strip()
    if not extracted_text:
        extracted_text = extract_literal_pdf_strings(file_bytes)
    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No readable text was found. This looks like a scanned/image PDF, so OCR is required before chat can search it.",
        )
    return extracted_text


def serialize_document(document: Document) -> DocumentResponse:
    return DocumentResponse(
        id=str(document.id),
        title=document.title,
        source_filename=document.source_filename,
        space=document.space,
        status=document.status,
        created_at=document.created_at.isoformat(),
        version_id=str(document.version_id),
    )


def get_document_or_404(document_id: str, repo: InMemoryDocumentRepository) -> Document:
    try:
        parsed_document_id = UUID(document_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Document not found") from exc
    document = repo.get(parsed_document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    repo: InMemoryDocumentRepository = Depends(get_repository),
    _user=Depends(require_permission("documents:view")),
):
    return [serialize_document(document) for document in repo.list()]


@router.post("", response_model=DocumentResponse)
def upload_document(
    payload: UploadDocumentRequest,
    repo: InMemoryDocumentRepository = Depends(get_repository),
    _user=Depends(require_permission("documents:upload")),
):
    document = Document(
        title=payload.title,
        source_filename=payload.source_filename,
        content=payload.content,
        space=payload.space,
    )
    return serialize_document(repo.add(document))


@router.post("/upload-file", response_model=DocumentResponse)
async def upload_document_file(
    title: str = Form(...),
    space: str = Form("General"),
    file: UploadFile = File(...),
    repo: InMemoryDocumentRepository = Depends(get_repository),
    _user=Depends(require_permission("documents:upload")),
):
    filename = file.filename or "uploaded.pdf"
    if file.content_type != "application/pdf" and not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    extracted_text = extract_pdf_text(file_bytes)
    document = Document(
        title=title,
        source_filename=filename,
        content=extracted_text,
        space=space,
        mime_type="text/plain",
    )
    return serialize_document(repo.add(document))


@router.get("/{document_id}/versions", response_model=list[DocumentVersionResponse])
def document_versions(
    document_id: str,
    repo: InMemoryDocumentRepository = Depends(get_repository),
    _user=Depends(require_permission("documents:view")),
):
    document = get_document_or_404(document_id, repo)
    return [
        DocumentVersionResponse(
            version_id=str(document.version_id),
            title=document.title,
            source_filename=document.source_filename,
            status=document.status,
            created_at=document.created_at.isoformat(),
        )
    ]


@router.get("/{document_id}/download")
def download_document(
    document_id: str,
    repo: InMemoryDocumentRepository = Depends(get_repository),
    _user=Depends(require_permission("documents:view")),
):
    document = get_document_or_404(document_id, repo)
    filename = document.source_filename.replace('"', "")
    return Response(
        content=document.content,
        media_type=document.mime_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.patch("/{document_id}/archive", response_model=DocumentResponse)
def archive_document(
    document_id: str,
    repo: InMemoryDocumentRepository = Depends(get_repository),
    _user=Depends(require_permission("documents:archive")),
):
    document = get_document_or_404(document_id, repo)
    archived_document = repo.archive(document.id)
    if archived_document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return serialize_document(archived_document)


@router.patch("/{document_id}/unarchive", response_model=DocumentResponse)
def unarchive_document(
    document_id: str,
    repo: InMemoryDocumentRepository = Depends(get_repository),
    _user=Depends(require_permission("documents:archive")),
):
    document = get_document_or_404(document_id, repo)
    restored_document = repo.unarchive(document.id)
    if restored_document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return serialize_document(restored_document)

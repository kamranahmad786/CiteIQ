from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    name: str = Field(min_length=2)
    email: str
    password: str = Field(min_length=6)
    organisation: str = "CiteIQ Workspace"


class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    roles: list[str]
    organisation: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    user: UserProfile


class DocumentResponse(BaseModel):
    id: str
    title: str
    source_filename: str
    space: str
    status: str
    created_at: str
    version_id: str


class DocumentVersionResponse(BaseModel):
    version_id: str
    title: str
    source_filename: str
    status: str
    created_at: str
    retention: str = "90 day review"


class UploadDocumentRequest(BaseModel):
    title: str
    source_filename: str
    content: str = Field(min_length=1)
    space: str = "General"


class ChatQuestionRequest(BaseModel):
    question: str = Field(min_length=2)
    top_k: int = 5
    document_id: str | None = None


class CitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    chunk_id: str
    document_title: str
    page_start: int
    page_end: int
    section: str | None = None
    score: float
    content: str


class ChatAnswerResponse(BaseModel):
    answer: str
    citations: list[CitationResponse]

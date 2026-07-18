from app.domain.documents.repository import InMemoryDocumentRepository
from app.domain.documents.seed import SEED_DOCUMENTS
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings
from app.core.permissions import has_permission
from app.core.security import decode_access_token
from app.schemas.api import UserProfile


repository = InMemoryDocumentRepository()
repository.seed(SEED_DOCUMENTS)
bearer_scheme = HTTPBearer(auto_error=False)


def get_repository() -> InMemoryDocumentRepository:
    return repository


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> UserProfile:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Please login to continue")
    try:
        payload = decode_access_token(credentials.credentials, get_settings().jwt_secret)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Your session expired. Please login again") from exc
    roles = payload.get("roles")
    if not isinstance(roles, list):
        roles = ["standard_user"]
    email = str(payload.get("email") or "")
    return UserProfile(
        id=str(payload.get("sub") or ""),
        email=email,
        name=email.split("@")[0] or "User",
        roles=[str(role) for role in roles],
        organisation="CiteIQ Workspace",
    )


def require_permission(permission: str):
    def checker(user: UserProfile = Depends(get_current_user)) -> UserProfile:
        if not has_permission(user.roles, permission):
            raise HTTPException(status_code=403, detail="You do not have access to perform this action")
        return user

    return checker

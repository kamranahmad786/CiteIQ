from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import build_access_token, build_refresh_token, hash_password, verify_password
from app.domain.auth.store import auth_store, to_profile
from app.schemas.api import LoginRequest, LoginResponse, RefreshRequest, SignupRequest, UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])

def normalize_email(email: str) -> str:
    return email.lower().strip()


def validate_email(email: str) -> None:
    if "@" not in email or "." not in email.split("@")[-1] or len(email) > 254:
        raise HTTPException(status_code=422, detail="Please enter a valid email address")


def validate_signup_password(password: str) -> None:
    has_letter = any(character.isalpha() for character in password)
    has_number = any(character.isdigit() for character in password)
    if len(password) < 8 or not has_letter or not has_number:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters and include a letter and a number")


def issue_token_pair(user: UserProfile) -> LoginResponse:
    settings = get_settings()
    access_token = build_access_token(
        {"sub": user.id, "email": user.email, "roles": user.roles},
        settings.jwt_secret,
        settings.access_token_minutes,
    )
    refresh_token = build_refresh_token()
    auth_store.save_refresh_token(user.id, refresh_token, settings.refresh_token_days)
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_minutes * 60,
        user=user,
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    normalized_email = normalize_email(payload.email)
    validate_email(normalized_email)
    user = auth_store.find_user(normalized_email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    auth_store.mark_login(user.id)
    return issue_token_pair(to_profile(user))


@router.post("/signup", response_model=LoginResponse)
def signup(payload: SignupRequest) -> LoginResponse:
    normalized_email = normalize_email(payload.email)
    validate_email(normalized_email)
    validate_signup_password(payload.password)
    if auth_store.find_user(normalized_email):
        raise HTTPException(status_code=409, detail="Email already exists")
    name = payload.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=422, detail="Please enter your full name")
    user = auth_store.create_user(
        email=normalized_email,
        name=name,
        organisation=payload.organisation.strip() or "CiteIQ Workspace",
        password_hash=hash_password(payload.password),
        roles=["standard_user"],
    )
    return issue_token_pair(user)


@router.post("/refresh", response_model=LoginResponse)
def refresh(payload: RefreshRequest) -> LoginResponse:
    user = auth_store.consume_refresh_token(payload.refresh_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired. Please login again")
    return issue_token_pair(user)


@router.post("/logout")
def logout(payload: RefreshRequest) -> dict[str, str]:
    auth_store.revoke_refresh_token(payload.refresh_token)
    return {"status": "logged_out"}


@router.get("/me", response_model=UserProfile)
def me(user: UserProfile = Depends(get_current_user)) -> UserProfile:
    user_record = auth_store.find_user(user.email)
    return to_profile(user_record) if user_record else user

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import build_access_token, build_refresh_token, hash_password, verify_password
from app.schemas.api import LoginRequest, LoginResponse, RefreshRequest, SignupRequest, UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])

DEMO_USER = UserProfile(
    id="11111111-1111-1111-1111-111111111111",
    email="admin@citeiq.test",
    name="CiteIQ Admin",
    roles=["platform_admin", "organisation_admin", "auditor"],
    organisation="CiteIQ Workspace",
)

SIGNED_UP_USERS: dict[str, tuple[UserProfile, str]] = {}
REFRESH_TOKENS: dict[str, str] = {}
DEMO_PASSWORD_HASH = hash_password("password")


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


def find_user_by_email(email: str) -> tuple[UserProfile, str | None] | None:
    if email == DEMO_USER.email:
        return DEMO_USER, DEMO_PASSWORD_HASH
    signed_up = SIGNED_UP_USERS.get(email)
    if signed_up:
        return signed_up[0], signed_up[1]
    return None


def issue_token_pair(user: UserProfile) -> LoginResponse:
    settings = get_settings()
    access_token = build_access_token(
        {"sub": user.id, "email": user.email, "roles": user.roles},
        settings.jwt_secret,
        settings.access_token_minutes,
    )
    refresh_token = build_refresh_token()
    REFRESH_TOKENS[refresh_token] = user.email
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
    user_record = find_user_by_email(normalized_email)
    if not user_record or not user_record[1] or not verify_password(payload.password, user_record[1]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return issue_token_pair(user_record[0])


@router.post("/signup", response_model=LoginResponse)
def signup(payload: SignupRequest) -> LoginResponse:
    normalized_email = normalize_email(payload.email)
    validate_email(normalized_email)
    validate_signup_password(payload.password)
    if normalized_email == DEMO_USER.email or normalized_email in SIGNED_UP_USERS:
        raise HTTPException(status_code=409, detail="Email already exists")
    name = payload.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=422, detail="Please enter your full name")
    user = UserProfile(
        id=str(uuid4()),
        email=normalized_email,
        name=name,
        roles=["standard_user"],
        organisation=payload.organisation.strip() or "CiteIQ Workspace",
    )
    SIGNED_UP_USERS[normalized_email] = (user, hash_password(payload.password))
    return issue_token_pair(user)


@router.post("/refresh", response_model=LoginResponse)
def refresh(payload: RefreshRequest) -> LoginResponse:
    email = REFRESH_TOKENS.pop(payload.refresh_token, None)
    if not email:
        raise HTTPException(status_code=401, detail="Session expired. Please login again")
    user_record = find_user_by_email(email)
    if not user_record:
        raise HTTPException(status_code=401, detail="Session expired. Please login again")
    return issue_token_pair(user_record[0])


@router.get("/me", response_model=UserProfile)
def me(user: UserProfile = Depends(get_current_user)) -> UserProfile:
    user_record = find_user_by_email(user.email)
    return user_record[0] if user_record else user

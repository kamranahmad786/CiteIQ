from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.core.config import get_settings
from app.core.security import build_access_token, build_refresh_token
from app.schemas.api import LoginRequest, LoginResponse, SignupRequest, UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])

DEMO_USER = UserProfile(
    id="11111111-1111-1111-1111-111111111111",
    email="admin@citeiq.test",
    name="CiteIQ Admin",
    roles=["platform_admin", "organisation_admin", "auditor"],
    organisation="CiteIQ Workspace",
)

SIGNED_UP_USERS: dict[str, tuple[UserProfile, str]] = {}


def issue_token_pair(user: UserProfile) -> LoginResponse:
    settings = get_settings()
    access_token = build_access_token(
        {"sub": user.id, "email": user.email, "roles": user.roles},
        settings.jwt_secret,
        settings.access_token_minutes,
    )
    return LoginResponse(
        access_token=access_token,
        refresh_token=build_refresh_token(),
        expires_in=settings.access_token_minutes * 60,
        user=user,
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    normalized_email = payload.email.lower().strip()
    if normalized_email == DEMO_USER.email and payload.password == "password":
        return issue_token_pair(DEMO_USER)
    signed_up = SIGNED_UP_USERS.get(normalized_email)
    if not signed_up or signed_up[1] != payload.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return issue_token_pair(signed_up[0])


@router.post("/signup", response_model=LoginResponse)
def signup(payload: SignupRequest) -> LoginResponse:
    normalized_email = payload.email.lower().strip()
    if normalized_email == DEMO_USER.email or normalized_email in SIGNED_UP_USERS:
        raise HTTPException(status_code=409, detail="Email already exists")
    user = UserProfile(
        id=str(uuid4()),
        email=normalized_email,
        name=payload.name.strip(),
        roles=["standard_user"],
        organisation=payload.organisation.strip() or "CiteIQ Workspace",
    )
    SIGNED_UP_USERS[normalized_email] = (user, payload.password)
    return issue_token_pair(user)


@router.post("/refresh", response_model=LoginResponse)
def refresh() -> LoginResponse:
    settings = get_settings()
    return LoginResponse(
        access_token=build_access_token({"sub": DEMO_USER.id, "email": DEMO_USER.email}, settings.jwt_secret, settings.access_token_minutes),
        refresh_token=build_refresh_token(),
        expires_in=settings.access_token_minutes * 60,
        user=DEMO_USER,
    )


@router.get("/me", response_model=UserProfile)
def me() -> UserProfile:
    return DEMO_USER

from __future__ import annotations

import json
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings
from app.core.security import hash_password, sha256_token
from app.schemas.api import UserProfile


def build_database_url(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
    return url


class Base(DeclarativeBase):
    pass


class AuthUser(Base):
    __tablename__ = "auth_users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    organisation: Mapped[str] = mapped_column(String(160), default="CiteIQ Workspace")
    password_hash: Mapped[str] = mapped_column(Text)
    roles_json: Mapped[str] = mapped_column(Text, default="[]")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    refresh_tokens: Mapped[list["AuthRefreshToken"]] = relationship(back_populates="user")


class AuthRefreshToken(Base):
    __tablename__ = "auth_refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("auth_users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    user: Mapped[AuthUser] = relationship(back_populates="refresh_tokens")


def create_session_factory():
    database_url = build_database_url(get_settings().database_url)
    if database_url == "sqlite://":
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
    else:
        engine = create_engine(database_url, pool_pre_ping=True)
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, expire_on_commit=False)


SessionLocal = create_session_factory()


def roles_to_json(roles: list[str]) -> str:
    return json.dumps(roles)


def json_to_roles(value: str) -> list[str]:
    parsed = json.loads(value or "[]")
    return [str(role) for role in parsed]


def to_profile(user: AuthUser) -> UserProfile:
    return UserProfile(
        id=user.id,
        email=user.email,
        name=user.name,
        roles=json_to_roles(user.roles_json),
        organisation=user.organisation,
    )


def as_aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


class AuthStore:
    def __init__(self, session_factory: sessionmaker[Session] = SessionLocal):
        self.session_factory = session_factory

    def ensure_demo_admin(self) -> None:
        with self.session_factory() as session:
            existing = session.scalar(select(AuthUser).where(AuthUser.email == "admin@citeiq.test"))
            if existing:
                return
            session.add(
                AuthUser(
                    id="11111111-1111-1111-1111-111111111111",
                    email="admin@citeiq.test",
                    name="CiteIQ Admin",
                    organisation="CiteIQ Workspace",
                    password_hash=hash_password("password"),
                    roles_json=roles_to_json(["platform_admin", "organisation_admin", "auditor"]),
                )
            )
            session.commit()

    def find_user(self, email: str) -> AuthUser | None:
        with self.session_factory() as session:
            return session.scalar(select(AuthUser).where(AuthUser.email == email, AuthUser.is_active.is_(True)))

    def create_user(self, *, email: str, name: str, organisation: str, password_hash: str, roles: list[str]) -> UserProfile:
        with self.session_factory() as session:
            user = AuthUser(
                id=str(uuid4()),
                email=email,
                name=name,
                organisation=organisation,
                password_hash=password_hash,
                roles_json=roles_to_json(roles),
            )
            session.add(user)
            session.commit()
            return to_profile(user)

    def mark_login(self, user_id: str) -> None:
        with self.session_factory() as session:
            user = session.get(AuthUser, user_id)
            if user:
                user.last_login_at = datetime.now(UTC)
                user.updated_at = datetime.now(UTC)
                session.commit()

    def save_refresh_token(self, user_id: str, refresh_token: str, ttl_days: int) -> None:
        with self.session_factory() as session:
            session.add(
                AuthRefreshToken(
                    id=str(uuid4()),
                    user_id=user_id,
                    token_hash=sha256_token(refresh_token),
                    expires_at=datetime.now(UTC) + timedelta(days=ttl_days),
                )
            )
            session.commit()

    def consume_refresh_token(self, refresh_token: str) -> UserProfile | None:
        token_hash = sha256_token(refresh_token)
        with self.session_factory() as session:
            token = session.scalar(
                select(AuthRefreshToken).where(
                    AuthRefreshToken.token_hash == token_hash,
                    AuthRefreshToken.revoked_at.is_(None),
                )
            )
            if not token or as_aware_utc(token.expires_at) < datetime.now(UTC):
                return None
            token.revoked_at = datetime.now(UTC)
            user = session.get(AuthUser, token.user_id)
            session.commit()
            if not user or not user.is_active:
                return None
            return to_profile(user)

    def revoke_refresh_token(self, refresh_token: str) -> None:
        token_hash = sha256_token(refresh_token)
        with self.session_factory() as session:
            token = session.scalar(select(AuthRefreshToken).where(AuthRefreshToken.token_hash == token_hash))
            if token and token.revoked_at is None:
                token.revoked_at = datetime.now(UTC)
                session.commit()


auth_store = AuthStore()
auth_store.ensure_demo_admin()

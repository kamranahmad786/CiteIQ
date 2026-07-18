from __future__ import annotations

import hashlib
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

try:
    from jose import jwt
    from passlib.context import CryptContext
except Exception:  # pragma: no cover - lets pure service tests run without optional deps
    jwt = None
    CryptContext = None


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") if CryptContext else None


@dataclass(frozen=True)
class TokenPair:
    access_token: str
    refresh_token: str
    expires_in: int


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    if pwd_context:
        try:
            return pwd_context.hash(password)
        except Exception:
            pass
    return "sha256$" + hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    if pwd_context and not password_hash.startswith("sha256$"):
        try:
            return pwd_context.verify(password, password_hash)
        except Exception:
            return False
    return secrets.compare_digest(hash_password(password), password_hash)


def sha256_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def build_access_token(payload: dict, secret: str, ttl_minutes: int) -> str:
    data = payload.copy()
    expires_at = utcnow() + timedelta(minutes=ttl_minutes)
    data.update({"exp": expires_at})
    if jwt:
        return jwt.encode(data, secret, algorithm="HS256")
    encoded = "|".join(f"{k}={v}" for k, v in sorted(data.items()))
    return "local." + hashlib.sha256((encoded + secret).encode("utf-8")).hexdigest()


def decode_access_token(token: str, secret: str) -> dict:
    if not jwt:
        return {}
    return jwt.decode(token, secret, algorithms=["HS256"])


def build_refresh_token() -> str:
    return secrets.token_urlsafe(64)

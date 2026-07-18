from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Enterprise RAG Document Intelligence Platform"
    api_prefix: str = "/api"
    environment: str = "local"
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://cite-iq.vercel.app",
    ]
    database_url: str = "sqlite://"
    jwt_secret: str = "replace-me-in-production"
    access_token_minutes: int = 15
    refresh_token_days: int = 14
    embedding_provider: str = "local"
    generation_provider: str = "local"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()

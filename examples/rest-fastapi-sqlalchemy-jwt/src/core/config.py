import os

from pydantic_settings import BaseSettings
from starlette.config import Config

cfd = os.path.dirname(os.path.realpath(__file__))
env_path = os.path.join(cfd, "..", "..", ".env")
config = Config(env_file=env_path)


class AppSettings(BaseSettings):
    APP_NAME: str = config("APP_NAME", default="FastAPI REST API")
    APP_DESCRIPTION: str = config("APP_DESCRIPTION", default="FastAPI REST API")
    APP_VERSION: str = config("APP_VERSION", default="1.0.0")
    LICENSE: str = config("LICENSE", default="MIT")
    CONTACT_NAME: str = config("CONTACT_NAME", default="John Doe")
    CONTACT_EMAIL: str = config("CONTACT_EMAIL", default="john.doe@example.com")


class CryptSettings(BaseSettings):
    SECRET_KEY: str = config("SECRET_KEY")
    ALGORITHM: str = config("ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30)
    REFRESH_TOKEN_EXPIRE_MINUTES: int = config(
        "REFRESH_TOKEN_EXPIRE_MINUTES", default=30
    )


class DatabaseSettings(BaseSettings):
    pass


class SQLiteSettings(DatabaseSettings):
    SQLITE_URI: str = config("SQLITE_URI", default="./sqlapp.db")
    SQLITE_SYNC_PREFIX: str = config("SQLITE_SYNC_PREFIX", default="sqlite:///")
    SQLITE_ASYNC_PREFIX: str = config(
        "SQLITE_ASYNC_PREFIX", default="sqlite+aiosqlite:///"
    )


class PostgresSettings(DatabaseSettings):
    POSTGRES_USER: str = config("POSTGRES_USER", default="postgres")
    POSTGRES_PASSWORD: str = config("POSTGRES_PASSWORD", default="postgres")
    POSTGRES_HOST: str = config("POSTGRES_HOST", default="localhost")
    POSTGRES_PORT: int = config("POSTGRES_PORT", default=5432)
    POSTGRES_DB: str = config("POSTGRES_DB", default="postgres")
    POSTGRES_SYNC_PREFIX: str = config("POSTGRES_SYNC_PREFIX", default="postgresql://")
    POSTGRES_ASYNC_PREFIX: str = config(
        "POSTGRES_ASYNC_PREFIX", default="postgresql+asyncpg://"
    )
    POSTGRES_URI: str = f"{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    POSTGRES_URL: str | None = config("POSTGRES_URL", default=None)


# TODO: Add More classes


class Settings(AppSettings, CryptSettings, SQLiteSettings, PostgresSettings):
    pass


settings = Settings()

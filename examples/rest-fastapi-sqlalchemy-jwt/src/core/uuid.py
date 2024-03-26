import uuid as BaseUUID
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_serializer


class HealthCheck(BaseModel):
    name: str
    version: str
    description: str


class UUIDSchema(BaseModel):
    uuid: BaseUUID.UUID = Field(default_factory=BaseUUID.uuid4)


class TimestampSchema(BaseModel):
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC).replace(tzinfo=None)
    )
    updated_at: datetime = Field(default=None)

    @field_serializer("created_at")
    def serialize_dates(self, created_at: datetime | None, _info: Any) -> str | None:
        return created_at.isoformat() if created_at is not None else None

    @field_serializer("updated_at")
    def serialize_updated_dates(
        self, updated_at: datetime | None, _info: Any
    ) -> str | None:
        return updated_at.isoformat() if updated_at is not None else None


class PersistenceDeletionSchema(BaseModel):
    deleted_at: datetime | None = Field(default=None)
    is_deleted: bool = False

    @field_serializer("delete_at")
    def serialize_dates(self, deleted_at: datetime | None, _info: Any) -> str | None:
        return deleted_at.isoformat() if deleted_at is not None else None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str


class TokenBlacklistSchema(BaseModel):
    token: str
    expired_at: datetime


class TokenBlacklistCreate(TokenBlacklistSchema):
    pass


class TokenBlacklistUpdate(TokenBlacklistSchema):
    pass

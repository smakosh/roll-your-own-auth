from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.core.uuid import PersistenceDeletionSchema, TimestampSchema, UUIDSchema


class UserBase(BaseModel):
    name: Annotated[str, Field(min_length=2, max_length=50, examples=["John Doe"])]
    email: Annotated[EmailStr, Field(examples=["john.doe@example.com"])]


class User(TimestampSchema, UserBase, UUIDSchema, PersistenceDeletionSchema):
    hashed_password: str
    is_superuser: bool = False


class UserRead(BaseModel):
    id: int
    name: Annotated[str, Field(min_length=2, max_length=50, examples=["John Doe"])]
    email: Annotated[EmailStr, Field(examples=["john.doe@example.com"])]


class UserCreate(UserBase):
    hashed_password: str


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: Annotated[
        str | None,
        Field(min_length=2, max_length=20, examples=["John Doe"], default=None),
    ]
    email: Annotated[
        EmailStr | None, Field(examples=["john.doe@example.com"], default=None)
    ]


class UserUpdateInternal(UserUpdate):
    updated_at: datetime


class UserDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime


class UserRestoreDeleted(BaseModel):
    pass

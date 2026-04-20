from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.models.user import UserRole
from app.schemas.common import ORMBaseSchema


class UserCreate(ORMBaseSchema):
    email: str
    password: str = Field(min_length=8, max_length=128)


class UserLogin(ORMBaseSchema):
    email: str
    password: str


class UserResponse(ORMBaseSchema):
    id: int
    email: str
    role: UserRole
    created_at: datetime

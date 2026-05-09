from __future__ import annotations

from datetime import datetime

from app.models.user import UserRole
from app.schemas.common import ORMBaseSchema


class UserLogin(ORMBaseSchema):
    email: str
    password: str


class UserResponse(ORMBaseSchema):
    id: int
    email: str
    role: UserRole
    created_at: datetime

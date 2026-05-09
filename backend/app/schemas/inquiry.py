from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMBaseSchema


class InquiryCreate(ORMBaseSchema):
    car_id: int
    name: str = Field(min_length=2, max_length=255)
    email: str = Field(min_length=3, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    message: str = Field(min_length=5, max_length=4000)


class InquiryResponse(ORMBaseSchema):
    id: int
    car_id: int
    user_id: int | None
    name: str
    email: str
    message: str
    state: str
    created_at: datetime
    car_title: str | None = None
    dealer_name: str | None = None


class InquiryUpdate(ORMBaseSchema):
    state: str = Field(max_length=50)

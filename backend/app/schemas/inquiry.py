from __future__ import annotations

from datetime import datetime
from enum import Enum
import re

from pydantic import EmailStr, Field, ValidationInfo, field_validator

from app.schemas.common import ORMBaseSchema


class InquiryType(str, Enum):
    BUY = "buy"
    SELL = "sell"
    SOURCING = "sourcing"
    GENERAL = "general"


class PreferredContactMethod(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    TEXT = "text"


class InquiryTimeline(str, Enum):
    IMMEDIATELY = "immediately"
    THIRTY_DAYS = "30_days"
    THREE_TO_SIX_MONTHS = "3_6_months"
    EXPLORING = "just_exploring"


SAFE_TEXT_PATTERN = re.compile(r"[<>]")
CONTROL_CHAR_PATTERN = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
PHONE_PATTERN = re.compile(r"^[0-9+().\-\s]{7,24}$")


def sanitize_plain_text(value: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError("Field cannot be empty.")
    if SAFE_TEXT_PATTERN.search(normalized):
        raise ValueError("HTML content is not allowed.")
    if CONTROL_CHAR_PATTERN.search(normalized):
        raise ValueError("Unsupported characters are not allowed.")
    return normalized


class InquiryCreate(ORMBaseSchema):
    car_id: int | None = None
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=24)
    location: str = Field(min_length=2, max_length=120)
    inquiry_type: InquiryType
    message: str = Field(min_length=20, max_length=1000)
    vehicle_of_interest: str | None = Field(default=None, max_length=120)
    budget_range: str | None = Field(default=None, max_length=80)
    preferred_contact_method: PreferredContactMethod | None = None
    timeline: InquiryTimeline | None = None
    company: str | None = Field(default=None, max_length=120)

    @field_validator(
        "name",
        "phone",
        "location",
        "message",
        "vehicle_of_interest",
        "budget_range",
        "company",
        mode="before",
    )
    @classmethod
    def strip_and_reject_html(cls, value: str | None, info: ValidationInfo) -> str | None:
        if value is None:
            return None
        normalized = str(value).strip()
        if not normalized and info.field_name in {"vehicle_of_interest", "budget_range", "company"}:
            return None
        return sanitize_plain_text(normalized)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digit_count = sum(character.isdigit() for character in value)
        if digit_count < 7 or digit_count > 20 or not PHONE_PATTERN.fullmatch(value):
            raise ValueError("Enter a valid phone number.")
        return value


class InquiryCreateResponse(ORMBaseSchema):
    message: str = "Inquiry received"


class InquiryResponse(ORMBaseSchema):
    id: int
    car_id: int | None
    user_id: int | None
    name: str
    email: str
    message: str
    state: str
    created_at: datetime
    car_title: str | None = None
    dealer_name: str | None = None
    phone: str | None = None
    location: str | None = None
    inquiry_type: str | None = None
    vehicle_of_interest: str | None = None
    budget_range: str | None = None
    preferred_contact_method: str | None = None
    timeline: str | None = None
    message_body: str | None = None


class InquiryUpdate(ORMBaseSchema):
    state: str = Field(max_length=50)


class InquiryBulkStatusUpdate(ORMBaseSchema):
    ids: list[int] = Field(min_length=1, max_length=200)
    state: str = Field(max_length=50)


class InquiryBulkDelete(ORMBaseSchema):
    ids: list[int] = Field(min_length=1, max_length=200)


class InquiryBulkActionResponse(ORMBaseSchema):
    updated: int = 0
    deleted: int = 0

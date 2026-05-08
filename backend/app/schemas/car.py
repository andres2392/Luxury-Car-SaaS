from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import Field

from app.schemas.car_image import CarImageResponse
from app.schemas.common import ORMBaseSchema
from app.schemas.dealer import DealerResponse


class CarCreate(ORMBaseSchema):
    title: str = Field(min_length=2, max_length=255)
    brand: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    year: int = Field(ge=1900)
    price: Decimal = Field(ge=0)
    mileage: int = Field(ge=0)
    description: str | None = None
    main_image_url: str | None = None
    dealer_id: int | None = None
    image_urls: list[str] = Field(default_factory=list)


class CarUpdate(ORMBaseSchema):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    brand: str | None = Field(default=None, min_length=1, max_length=100)
    model: str | None = Field(default=None, min_length=1, max_length=100)
    year: int | None = Field(default=None, ge=1900)
    price: Decimal | None = Field(default=None, ge=0)
    mileage: int | None = Field(default=None, ge=0)
    description: str | None = None
    main_image_url: str | None = None
    dealer_id: int | None = None
    image_urls: list[str] | None = None


class CarResponse(ORMBaseSchema):
    id: int
    title: str
    brand: str
    model: str
    year: int
    price: Decimal
    mileage: int
    description: str | None
    main_image_url: str | None
    dealer_id: int
    created_at: datetime
    image_urls: list[str]
    images: list[CarImageResponse]
    dealer: DealerResponse

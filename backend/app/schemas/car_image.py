from __future__ import annotations

from datetime import datetime

from app.schemas.common import ORMBaseSchema


class CarImageResponse(ORMBaseSchema):
    id: int
    car_id: int
    image_url: str
    storage_path: str | None = None
    created_at: datetime

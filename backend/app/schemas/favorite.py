from __future__ import annotations

from datetime import datetime

from app.schemas.common import ORMBaseSchema


class FavoriteActionResponse(ORMBaseSchema):
    car_id: int
    is_saved: bool
    message: str


class FavoriteResponse(ORMBaseSchema):
    id: int
    user_id: int
    car_id: int
    created_at: datetime

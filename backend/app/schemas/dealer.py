from __future__ import annotations

from datetime import datetime

from app.schemas.common import ORMBaseSchema


class DealerResponse(ORMBaseSchema):
    id: int
    name: str
    description: str | None
    contact_email: str
    created_at: datetime


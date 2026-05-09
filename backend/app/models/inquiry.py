from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[int] = mapped_column(primary_key=True)
    car_id: Mapped[int | None] = mapped_column(
        ForeignKey("cars.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False, default="new", server_default="new")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    car: Mapped["Car | None"] = relationship(back_populates="inquiries")
    user: Mapped["User | None"] = relationship(back_populates="inquiries")

    @property
    def car_title(self) -> str | None:
        return self.car.title if self.car is not None else None

    @property
    def dealer_name(self) -> str | None:
        if self.car is None or self.car.dealer is None:
            return None
        return self.car.dealer.name

    def _parsed_message_lines(self) -> dict[str, str]:
        details: dict[str, str] = {}
        for line in self.message.splitlines():
            if not line.strip():
                break
            key, separator, value = line.partition(":")
            if separator:
                details[key.strip().lower()] = value.strip()
        return details

    @property
    def phone(self) -> str | None:
        return self._parsed_message_lines().get("phone")

    @property
    def location(self) -> str | None:
        return self._parsed_message_lines().get("location")

    @property
    def inquiry_type(self) -> str | None:
        return self._parsed_message_lines().get("inquiry type")

    @property
    def vehicle_of_interest(self) -> str | None:
        value = self._parsed_message_lines().get("vehicle of interest")
        return None if value in {None, "Open / not specified"} else value

    @property
    def budget_range(self) -> str | None:
        value = self._parsed_message_lines().get("budget range")
        return None if value in {None, "Not provided"} else value

    @property
    def preferred_contact_method(self) -> str | None:
        value = self._parsed_message_lines().get("preferred contact method")
        return None if value in {None, "Not provided"} else value

    @property
    def timeline(self) -> str | None:
        value = self._parsed_message_lines().get("timeline")
        return None if value in {None, "Not provided"} else value

    @property
    def message_body(self) -> str:
        parts = self.message.split("\n\n", 1)
        return parts[1].strip() if len(parts) > 1 else self.message

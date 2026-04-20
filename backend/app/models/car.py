from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Car(Base):
    __tablename__ = "cars"
    __table_args__ = (
        CheckConstraint("year >= 1900", name="ck_cars_year_min"),
        CheckConstraint("price >= 0", name="ck_cars_price_positive"),
        CheckConstraint("mileage >= 0", name="ck_cars_mileage_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    model: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    year: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), index=True, nullable=False)
    mileage: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    main_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    dealer_id: Mapped[int] = mapped_column(
        ForeignKey("dealers.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    dealer: Mapped["Dealer"] = relationship(back_populates="cars")
    images: Mapped[list["CarImage"]] = relationship(
        back_populates="car",
        cascade="all, delete-orphan",
    )
    inquiries: Mapped[list["Inquiry"]] = relationship(
        back_populates="car",
        cascade="all, delete-orphan",
    )


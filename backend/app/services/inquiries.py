from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.car import Car
from app.models.inquiry import Inquiry
from app.models.user import User
from app.schemas.inquiry import InquiryCreate


def create_inquiry(db: Session, payload: InquiryCreate, current_user: User | None = None) -> Inquiry:
    car = db.get(Car, payload.car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found.")

    inquiry = Inquiry(
        car_id=payload.car_id,
        user_id=current_user.id if current_user is not None else None,
        name=payload.name,
        email=payload.email,
        message=payload.message,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry


def get_inquiries(db: Session) -> list[Inquiry]:
    return list(db.scalars(select(Inquiry).order_by(Inquiry.created_at.desc())).all())


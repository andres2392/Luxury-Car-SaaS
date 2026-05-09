from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.car import Car
from app.models.dealer import Dealer
from app.models.inquiry import Inquiry
from app.models.user import User, UserRole
from app.schemas.inquiry import InquiryCreate

INQUIRY_STATES = {"new", "contacted", "negotiating", "reserved", "sold", "archived"}


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
        state="new",
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry


def get_inquiries_for_dashboard(db: Session, current_user: User) -> list[Inquiry]:
    query = (
        select(Inquiry)
        .join(Inquiry.car)
        .join(Car.dealer)
        .options(joinedload(Inquiry.car).joinedload(Car.dealer))
        .order_by(Inquiry.created_at.desc())
    )

    if current_user.role == UserRole.ADMIN:
        return list(db.scalars(query).all())

    dealer = db.scalar(select(Dealer).where(Dealer.contact_email == current_user.email))
    if dealer is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No dealer profile is linked to this account.",
        )

    return list(db.scalars(query.where(Dealer.id == dealer.id)).all())


def update_inquiry_state(
    db: Session,
    inquiry_id: int,
    state: str,
    current_user: User,
) -> Inquiry:
    normalized_state = state.lower().strip()
    if normalized_state not in INQUIRY_STATES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid inquiry state.")

    query = (
        select(Inquiry)
        .join(Inquiry.car)
        .join(Car.dealer)
        .options(joinedload(Inquiry.car).joinedload(Car.dealer))
        .where(Inquiry.id == inquiry_id)
    )

    if current_user.role != UserRole.ADMIN:
        dealer = db.scalar(select(Dealer).where(Dealer.contact_email == current_user.email))
        if dealer is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No dealer profile is linked to this account.",
            )
        query = query.where(Dealer.id == dealer.id)

    inquiry = db.scalar(query)
    if inquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found.")

    inquiry.state = normalized_state
    db.commit()
    db.refresh(inquiry)
    return inquiry

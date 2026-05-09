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


def build_public_inquiry_message(payload: InquiryCreate) -> str:
    lines = [
        f"Inquiry type: {payload.inquiry_type.value}",
        f"Phone: {payload.phone}",
        f"Location: {payload.location}",
        f"Vehicle of interest: {payload.vehicle_of_interest or 'Open / not specified'}",
        f"Budget range: {payload.budget_range or 'Not provided'}",
        f"Preferred contact method: {payload.preferred_contact_method.value if payload.preferred_contact_method else 'Not provided'}",
        f"Timeline: {payload.timeline.value if payload.timeline else 'Not provided'}",
        "",
        payload.message,
    ]
    return "\n".join(lines)


def create_inquiry(db: Session, payload: InquiryCreate, current_user: User | None = None) -> Inquiry:
    if payload.company:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid inquiry payload.")

    if payload.car_id is not None:
        car = db.get(Car, payload.car_id)
        if car is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found.")

    inquiry = Inquiry(
        car_id=payload.car_id,
        user_id=current_user.id if current_user is not None else None,
        name=payload.name,
        email=str(payload.email),
        message=build_public_inquiry_message(payload),
        state="new",
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry


def get_inquiries_for_dashboard(db: Session, current_user: User) -> list[Inquiry]:
    query = accessible_inquiry_query(current_user)
    query = inquiry_scope_filter(db, query, current_user)
    return list(db.scalars(query.order_by(Inquiry.created_at.desc())).all())


def get_current_dealer(db: Session, current_user: User) -> Dealer:
    dealer = db.scalar(select(Dealer).where(Dealer.contact_email == current_user.email))
    if dealer is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No dealer profile is linked to this account.",
        )
    return dealer


def accessible_inquiry_query(current_user: User):
    query = (
        select(Inquiry)
        .options(joinedload(Inquiry.car).joinedload(Car.dealer))
    )

    if current_user.role == UserRole.ADMIN:
        return query

    return query.join(Inquiry.car).join(Car.dealer)


def inquiry_scope_filter(db: Session, query, current_user: User):
    if current_user.role == UserRole.ADMIN:
        return query

    dealer = get_current_dealer(db, current_user)
    return query.where(Dealer.id == dealer.id)


def update_inquiry_state(
    db: Session,
    inquiry_id: int,
    state: str,
    current_user: User,
) -> Inquiry:
    normalized_state = state.lower().strip()
    if normalized_state not in INQUIRY_STATES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid inquiry state.")

    query = accessible_inquiry_query(current_user).where(Inquiry.id == inquiry_id)
    query = inquiry_scope_filter(db, query, current_user)

    inquiry = db.scalar(query)
    if inquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found.")

    inquiry.state = normalized_state
    db.commit()
    db.refresh(inquiry)
    return inquiry


def delete_inquiry(db: Session, inquiry_id: int, current_user: User) -> None:
    query = accessible_inquiry_query(current_user).where(Inquiry.id == inquiry_id)
    query = inquiry_scope_filter(db, query, current_user)

    inquiry = db.scalar(query)
    if inquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found.")

    db.delete(inquiry)
    db.commit()


def bulk_update_inquiry_state(db: Session, inquiry_ids: list[int], state: str, current_user: User) -> int:
    normalized_state = state.lower().strip()
    if normalized_state not in INQUIRY_STATES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid inquiry state.")

    query = accessible_inquiry_query(current_user).where(Inquiry.id.in_(inquiry_ids))
    query = inquiry_scope_filter(db, query, current_user)
    inquiries = list(db.scalars(query).all())

    for inquiry in inquiries:
        inquiry.state = normalized_state

    db.commit()
    return len(inquiries)


def bulk_delete_inquiries(db: Session, inquiry_ids: list[int], current_user: User) -> int:
    query = accessible_inquiry_query(current_user).where(Inquiry.id.in_(inquiry_ids))
    query = inquiry_scope_filter(db, query, current_user)
    inquiries = list(db.scalars(query).all())

    for inquiry in inquiries:
        db.delete(inquiry)

    db.commit()
    return len(inquiries)

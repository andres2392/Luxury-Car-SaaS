from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.dealer import Dealer


def get_dealers(db: Session) -> list[Dealer]:
    return list(db.scalars(select(Dealer).order_by(Dealer.name)).all())


def get_dealer_by_id(db: Session, dealer_id: int) -> Dealer:
    dealer = db.get(Dealer, dealer_id)
    if dealer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dealer not found.")
    return dealer


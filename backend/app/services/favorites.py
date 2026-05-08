from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.car import Car
from app.models.favorite import Favorite
from app.models.user import User
from app.schemas.favorite import FavoriteActionResponse


def _favorite_car_query():
    return select(Car).options(joinedload(Car.dealer), joinedload(Car.images))


def save_favorite(db: Session, car_id: int, current_user: User) -> FavoriteActionResponse:
    car = db.get(Car, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found.")

    existing_favorite = db.scalar(
        select(Favorite).where(Favorite.user_id == current_user.id, Favorite.car_id == car_id)
    )
    if existing_favorite is not None:
        return FavoriteActionResponse(
            car_id=car_id,
            is_saved=True,
            message="Car is already saved.",
        )

    db.add(Favorite(user_id=current_user.id, car_id=car_id))
    db.commit()

    return FavoriteActionResponse(
        car_id=car_id,
        is_saved=True,
        message="Car saved successfully.",
    )


def remove_favorite(db: Session, car_id: int, current_user: User) -> FavoriteActionResponse:
    favorite = db.scalar(
        select(Favorite).where(Favorite.user_id == current_user.id, Favorite.car_id == car_id)
    )
    if favorite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved car not found.")

    db.delete(favorite)
    db.commit()

    return FavoriteActionResponse(
        car_id=car_id,
        is_saved=False,
        message="Car removed from saved cars.",
    )


def get_favorite_cars(db: Session, current_user: User) -> list[Car]:
    query = (
        _favorite_car_query()
        .join(Favorite, Favorite.car_id == Car.id)
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )
    return list(db.scalars(query).unique().all())

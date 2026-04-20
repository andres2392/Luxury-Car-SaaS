from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import Session, joinedload

from app.models.car import Car
from app.models.car_image import CarImage
from app.models.dealer import Dealer
from app.models.user import User, UserRole
from app.schemas.car import CarCreate, CarUpdate


def _car_query() -> Select[tuple[Car]]:
    return select(Car).options(joinedload(Car.dealer), joinedload(Car.images))


def get_cars(
    db: Session,
    brand: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    year: int | None = None,
) -> list[Car]:
    query = _car_query()

    if brand:
        query = query.where(Car.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        query = query.where(Car.price >= min_price)
    if max_price is not None:
        query = query.where(Car.price <= max_price)
    if year is not None:
        query = query.where(Car.year == year)

    query = query.order_by(Car.created_at.desc())
    return list(db.scalars(query).unique().all())


def get_car_by_id(db: Session, car_id: int) -> Car:
    car = db.scalars(_car_query().where(Car.id == car_id)).unique().one_or_none()
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found.")
    return car


def create_car(db: Session, payload: CarCreate, current_user: User) -> Car:
    if current_user.role not in {UserRole.ADMIN, UserRole.DEALER}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins and dealers can create cars.")

    dealer = db.get(Dealer, payload.dealer_id)
    if dealer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dealer not found.")

    car = Car(
        title=payload.title,
        brand=payload.brand,
        model=payload.model,
        year=payload.year,
        price=payload.price,
        mileage=payload.mileage,
        description=payload.description,
        main_image_url=payload.main_image_url,
        dealer_id=payload.dealer_id,
    )
    db.add(car)
    db.flush()

    for image_url in payload.image_urls:
        db.add(CarImage(car_id=car.id, image_url=image_url))

    db.commit()
    return get_car_by_id(db, car.id)


def update_car(db: Session, car_id: int, payload: CarUpdate, current_user: User) -> Car:
    if current_user.role not in {UserRole.ADMIN, UserRole.DEALER}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins and dealers can update cars.")

    car = db.scalars(_car_query().where(Car.id == car_id)).unique().one_or_none()
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found.")

    updates = payload.model_dump(exclude_unset=True, exclude={"image_urls"})
    if "dealer_id" in updates:
        dealer = db.get(Dealer, updates["dealer_id"])
        if dealer is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dealer not found.")

    for field, value in updates.items():
        setattr(car, field, value)

    if payload.image_urls is not None:
        car.images.clear()
        for image_url in payload.image_urls:
            car.images.append(CarImage(image_url=image_url))

    db.commit()
    return get_car_by_id(db, car.id)


def delete_car(db: Session, car_id: int, current_user: User) -> None:
    if current_user.role not in {UserRole.ADMIN, UserRole.DEALER}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins and dealers can delete cars.")

    car = db.get(Car, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found.")

    db.delete(car)
    db.commit()

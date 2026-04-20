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


def _get_dealer_for_user(db: Session, current_user: User) -> Dealer:
    dealer = db.scalar(select(Dealer).where(Dealer.contact_email == current_user.email))
    if dealer is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No dealer profile is linked to this account.",
        )
    return dealer


def _get_manageable_car(db: Session, car_id: int, current_user: User) -> Car:
    car = db.scalars(_car_query().where(Car.id == car_id)).unique().one_or_none()
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found.")

    if current_user.role == UserRole.DEALER:
        dealer = _get_dealer_for_user(db, current_user)
        if car.dealer_id != dealer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only manage cars from your own dealership.",
            )

    return car


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


def get_cars_for_dashboard(db: Session, current_user: User) -> list[Car]:
    if current_user.role == UserRole.ADMIN:
        return get_cars(db)

    dealer = _get_dealer_for_user(db, current_user)
    query = _car_query().where(Car.dealer_id == dealer.id).order_by(Car.created_at.desc())
    return list(db.scalars(query).unique().all())


def create_car(db: Session, payload: CarCreate, current_user: User) -> Car:
    if current_user.role == UserRole.ADMIN:
        if payload.dealer_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="dealer_id is required for admin car creation.")
        dealer = db.get(Dealer, payload.dealer_id)
        if dealer is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dealer not found.")
        dealer_id = dealer.id
    else:
        dealer = _get_dealer_for_user(db, current_user)
        dealer_id = dealer.id

    car = Car(
        title=payload.title,
        brand=payload.brand,
        model=payload.model,
        year=payload.year,
        price=payload.price,
        mileage=payload.mileage,
        description=payload.description,
        main_image_url=payload.main_image_url,
        dealer_id=dealer_id,
    )
    db.add(car)
    db.flush()

    for image_url in payload.image_urls:
        db.add(CarImage(car_id=car.id, image_url=image_url))

    db.commit()
    return get_car_by_id(db, car.id)


def update_car(db: Session, car_id: int, payload: CarUpdate, current_user: User) -> Car:
    car = _get_manageable_car(db, car_id, current_user)

    updates = payload.model_dump(exclude_unset=True, exclude={"image_urls"})
    if "dealer_id" in updates:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Dealers cannot reassign cars to another dealership.",
            )
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
    car = _get_manageable_car(db, car_id, current_user)

    db.delete(car)
    db.commit()

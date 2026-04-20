from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_dashboard_user, require_dealer_or_admin
from app.models.user import User
from app.schemas.car import CarCreate, CarResponse, CarUpdate
from app.services.cars import (
    create_car,
    delete_car,
    get_car_by_id,
    get_cars,
    get_cars_for_dashboard,
    update_car,
)

router = APIRouter(prefix="/cars", tags=["cars"])


@router.get("", response_model=list[CarResponse])
def list_cars(
    db: Annotated[Session, Depends(get_db)],
    brand: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    year: int | None = Query(default=None, ge=1900),
) -> list[CarResponse]:
    return get_cars(db, brand=brand, min_price=min_price, max_price=max_price, year=year)


@router.get("/mine", response_model=list[CarResponse])
def list_my_cars(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dashboard_user)],
) -> list[CarResponse]:
    return get_cars_for_dashboard(db, current_user)


@router.get("/{car_id}", response_model=CarResponse)
def get_car(car_id: int, db: Annotated[Session, Depends(get_db)]) -> CarResponse:
    return get_car_by_id(db, car_id)


@router.post("", response_model=CarResponse, status_code=201)
def create_car_route(
    payload: CarCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dealer_or_admin)],
) -> CarResponse:
    return create_car(db, payload, current_user)


@router.put("/{car_id}", response_model=CarResponse)
def update_car_route(
    car_id: int,
    payload: CarUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dealer_or_admin)],
) -> CarResponse:
    return update_car(db, car_id, payload, current_user)


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_car_route(
    car_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dealer_or_admin)],
) -> Response:
    delete_car(db, car_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

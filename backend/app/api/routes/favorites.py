from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.car import CarResponse
from app.schemas.favorite import FavoriteActionResponse
from app.services.favorites import get_favorite_cars, remove_favorite, save_favorite

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[CarResponse])
def list_favorites(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[CarResponse]:
    return get_favorite_cars(db, current_user)


@router.post("/{car_id}", response_model=FavoriteActionResponse, status_code=201)
def save_favorite_route(
    car_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> FavoriteActionResponse:
    return save_favorite(db, car_id, current_user)


@router.delete("/{car_id}", response_model=FavoriteActionResponse)
def remove_favorite_route(
    car_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> FavoriteActionResponse:
    return remove_favorite(db, car_id, current_user)

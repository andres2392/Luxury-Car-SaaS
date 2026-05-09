from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_dashboard_user, require_dealer_or_admin
from app.core.storage import MAX_IMAGE_FILE_SIZE_BYTES, MAX_IMAGE_UPLOAD_COUNT
from app.schemas.car_image import CarImageResponse
from app.models.user import User
from app.schemas.car import CarCreate, CarResponse, CarUpdate
from app.services.cars import (
    create_car,
    delete_car,
    delete_car_image,
    get_car_by_id,
    get_cars,
    get_cars_for_dashboard,
    set_featured_car_image,
    update_car,
    upload_car_images,
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


@router.post("/{car_id}/images", response_model=list[CarImageResponse], status_code=201)
async def upload_car_images_route(
    car_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dealer_or_admin)],
    files: Annotated[list[UploadFile], File(...)],
) -> list[CarImageResponse]:
    if len(files) > MAX_IMAGE_UPLOAD_COUNT:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Upload no more than {MAX_IMAGE_UPLOAD_COUNT} images at a time.",
        )

    payloads: list[tuple[str | None, str | None, bytes]] = []
    for file in files:
        content = await file.read(MAX_IMAGE_FILE_SIZE_BYTES + 1)
        payloads.append((file.filename, file.content_type, content))

    return upload_car_images(db, car_id, payloads, current_user)


@router.delete("/{car_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_car_image_route(
    car_id: int,
    image_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dealer_or_admin)],
) -> Response:
    delete_car_image(db, car_id, image_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{car_id}/images/{image_id}/featured", response_model=CarResponse)
def set_featured_car_image_route(
    car_id: int,
    image_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dealer_or_admin)],
) -> CarResponse:
    return set_featured_car_image(db, car_id, image_id, current_user)

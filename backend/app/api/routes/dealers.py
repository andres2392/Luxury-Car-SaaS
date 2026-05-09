from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.models.user import User
from app.schemas.dealer import DealerResponse
from app.services.dealers import get_dealer_by_id, get_dealers

router = APIRouter(prefix="/dealers", tags=["dealers"])


@router.get("", response_model=list[DealerResponse])
def list_dealers(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> list[DealerResponse]:
    return get_dealers(db)


@router.get("/{dealer_id}", response_model=DealerResponse)
def get_dealer(
    dealer_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> DealerResponse:
    return get_dealer_by_id(db, dealer_id)

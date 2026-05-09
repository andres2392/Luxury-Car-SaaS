from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_optional_current_user, require_dashboard_user
from app.models.user import User
from app.schemas.inquiry import InquiryCreate, InquiryResponse, InquiryUpdate
from app.services.inquiries import (
    create_inquiry,
    get_inquiries_for_dashboard,
    update_inquiry_state,
)

router = APIRouter(prefix="/inquiries", tags=["inquiries"])


@router.post("", response_model=InquiryResponse, status_code=201)
def create_inquiry_route(
    payload: InquiryCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_optional_current_user)],
) -> InquiryResponse:
    return create_inquiry(db, payload, current_user)


@router.get("", response_model=list[InquiryResponse])
def list_inquiries(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dashboard_user)],
) -> list[InquiryResponse]:
    return get_inquiries_for_dashboard(db, current_user)


@router.patch("/{inquiry_id}", response_model=InquiryResponse)
def update_inquiry_route(
    inquiry_id: int,
    payload: InquiryUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dashboard_user)],
) -> InquiryResponse:
    return update_inquiry_state(db, inquiry_id, payload.state, current_user)

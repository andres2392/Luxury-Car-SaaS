from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_optional_current_user, require_admin
from app.models.user import User
from app.schemas.inquiry import InquiryCreate, InquiryResponse
from app.services.inquiries import create_inquiry, get_inquiries

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
    _: Annotated[User, Depends(require_admin)],
) -> list[InquiryResponse]:
    return get_inquiries(db)


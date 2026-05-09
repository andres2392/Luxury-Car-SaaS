from typing import Annotated
import time

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_optional_current_user, require_dashboard_user
from app.models.user import User
from app.schemas.inquiry import (
    InquiryBulkActionResponse,
    InquiryBulkDelete,
    InquiryBulkStatusUpdate,
    InquiryCreate,
    InquiryCreateResponse,
    InquiryResponse,
    InquiryUpdate,
)
from app.services.inquiries import (
    bulk_delete_inquiries,
    bulk_update_inquiry_state,
    create_inquiry,
    delete_inquiry,
    get_inquiries_for_dashboard,
    update_inquiry_state,
)

router = APIRouter(prefix="/inquiries", tags=["inquiries"])
PUBLIC_INQUIRY_WINDOW_SECONDS = 60
PUBLIC_INQUIRY_MAX_REQUESTS = 5
public_inquiry_attempts: dict[str, list[float]] = {}


def check_public_inquiry_rate_limit(request: Request) -> None:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded_for.split(",", 1)[0].strip() or (request.client.host if request.client else "unknown")
    now = time.monotonic()
    recent_attempts = [
        timestamp
        for timestamp in public_inquiry_attempts.get(client_ip, [])
        if now - timestamp < PUBLIC_INQUIRY_WINDOW_SECONDS
    ]
    if len(recent_attempts) >= PUBLIC_INQUIRY_MAX_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait before submitting another inquiry.",
        )
    recent_attempts.append(now)
    public_inquiry_attempts[client_ip] = recent_attempts


@router.post("", response_model=InquiryCreateResponse, status_code=201)
def create_inquiry_route(
    payload: InquiryCreate,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_optional_current_user)],
) -> InquiryCreateResponse:
    check_public_inquiry_rate_limit(request)
    try:
        create_inquiry(db, payload, current_user)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not receive inquiry at this time.",
        ) from exc
    return InquiryCreateResponse()


@router.get("", response_model=list[InquiryResponse])
def list_inquiries(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dashboard_user)],
) -> list[InquiryResponse]:
    return get_inquiries_for_dashboard(db, current_user)


@router.patch("/bulk-status", response_model=InquiryBulkActionResponse)
def bulk_update_inquiry_status_route(
    payload: InquiryBulkStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dashboard_user)],
) -> InquiryBulkActionResponse:
    updated = bulk_update_inquiry_state(db, payload.ids, payload.state, current_user)
    return InquiryBulkActionResponse(updated=updated)


@router.delete("/bulk", response_model=InquiryBulkActionResponse)
def bulk_delete_inquiries_route(
    payload: InquiryBulkDelete,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dashboard_user)],
) -> InquiryBulkActionResponse:
    deleted = bulk_delete_inquiries(db, payload.ids, current_user)
    return InquiryBulkActionResponse(deleted=deleted)


@router.patch("/{inquiry_id}", response_model=InquiryResponse)
def update_inquiry_route(
    inquiry_id: int,
    payload: InquiryUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dashboard_user)],
) -> InquiryResponse:
    return update_inquiry_state(db, inquiry_id, payload.state, current_user)


@router.patch("/{inquiry_id}/status", response_model=InquiryResponse)
def update_inquiry_status_route(
    inquiry_id: int,
    payload: InquiryUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dashboard_user)],
) -> InquiryResponse:
    return update_inquiry_state(db, inquiry_id, payload.state, current_user)


@router.delete("/{inquiry_id}", status_code=204)
def delete_inquiry_route(
    inquiry_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_dashboard_user)],
) -> Response:
    delete_inquiry(db, inquiry_id, current_user)
    return Response(status_code=204)

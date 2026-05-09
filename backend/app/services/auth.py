from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.models.user import User, UserRole
from app.schemas.auth import TokenResponse
from app.schemas.user import UserLogin


def login_user(db: Session, payload: UserLogin) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    if user.role not in {UserRole.ADMIN, UserRole.DEALER}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account no longer has access to the platform.",
        )

    return TokenResponse(access_token=create_access_token(user.id), user=user)

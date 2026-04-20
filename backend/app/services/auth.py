from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserRole
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate, UserLogin


def signup_user(db: Session, payload: UserCreate) -> TokenResponse:
    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered.")

    assigned_role = (
        UserRole.ADMIN
        if payload.email.lower() == settings.admin_email.lower()
        else UserRole.CUSTOMER
    )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=assigned_role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_access_token(user.id), user=user)


def login_user(db: Session, payload: UserLogin) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    return TokenResponse(access_token=create_access_token(user.id), user=user)

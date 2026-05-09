from app.schemas.auth import TokenResponse
from app.schemas.car import CarCreate, CarResponse, CarUpdate
from app.schemas.dealer import DealerResponse
from app.schemas.inquiry import InquiryCreate, InquiryResponse
from app.schemas.user import UserLogin, UserResponse

__all__ = [
    "TokenResponse",
    "CarCreate",
    "CarResponse",
    "CarUpdate",
    "DealerResponse",
    "InquiryCreate",
    "InquiryResponse",
    "UserLogin",
    "UserResponse",
]

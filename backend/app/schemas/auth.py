from app.schemas.common import ORMBaseSchema
from app.schemas.user import UserResponse


class TokenResponse(ORMBaseSchema):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


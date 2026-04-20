from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    project_name: str = Field(default="Luxury-Car-SaaS Backend", alias="PROJECT_NAME")
    api_v1_str: str = Field(default="/api/v1", alias="API_V1_STR")
    postgres_server: str = Field(default="localhost", alias="POSTGRES_SERVER")
    postgres_port: int = Field(default=5432, alias="POSTGRES_PORT")
    postgres_db: str = Field(default="luxury_car_saas", alias="POSTGRES_DB")
    postgres_user: str = Field(default="luxury_admin", alias="POSTGRES_USER")
    postgres_password: str = Field(default="luxury_password", alias="POSTGRES_PASSWORD")
    database_url: str = Field(
        default="postgresql+psycopg://luxury_admin:luxury_password@localhost:5432/luxury_car_saas",
        alias="DATABASE_URL",
    )
    secret_key: str = Field(default="change-this-in-production", alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    backend_cors_origins: str = Field(default="http://localhost:3000", alias="BACKEND_CORS_ORIGINS")
    admin_email: str = Field(default="admin@luxury.owner", alias="ADMIN_EMAIL")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

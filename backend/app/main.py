from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.core.config import settings

app = FastAPI(
    title=settings.project_name,
    version="0.1.0",
    description="Backend foundation for the Luxury-Car-SaaS platform.",
)

app.include_router(health_router, tags=["health"])


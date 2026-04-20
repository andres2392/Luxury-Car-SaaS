from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.cars import router as cars_router
from app.api.routes.dealers import router as dealers_router
from app.api.routes.health import router as health_router
from app.api.routes.inquiries import router as inquiries_router
from app.core.config import settings

app = FastAPI(
    title=settings.project_name,
    version="0.1.0",
    description="Backend foundation for the Luxury-Car-SaaS platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.backend_cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["health"])
app.include_router(auth_router)
app.include_router(cars_router)
app.include_router(dealers_router)
app.include_router(inquiries_router)

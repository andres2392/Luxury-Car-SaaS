from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.cars import router as cars_router
from app.api.routes.dealers import router as dealers_router
from app.api.routes.health import router as health_router
from app.api.routes.inquiries import router as inquiries_router
from app.core.config import settings

cors_origins = [origin.strip() for origin in settings.backend_cors_origins.split(",") if origin.strip()]
if "*" in cors_origins:
    raise RuntimeError("BACKEND_CORS_ORIGINS must list explicit origins when credentials are enabled.")

app = FastAPI(
    title=settings.project_name,
    version="0.1.0",
    description="Backend foundation for the Luxury-Car-SaaS platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request, call_next) -> Response:
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    return response


app.include_router(health_router, tags=["health"])
app.include_router(auth_router)
app.include_router(cars_router)
app.include_router(dealers_router)
app.include_router(inquiries_router)

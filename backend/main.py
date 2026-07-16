
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator

from api.middleware import RateLimitMiddleware
from api.routers.auth import auth_router
from api.routers.healthcheck import healthcheck_router
from api.routers.idea import idea_router
from api.routers.user import user_router
from config.settings import settings
from db.database import engine
from exceptions.base import AppError


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(lifespan=lifespan)

if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.add_middleware(
    RateLimitMiddleware,
    requests_limit=settings.RATE_LIMIT_REQUESTS_LIMIT,
    window_seconds=settings.RATE_LIMIT_WINDOW_SECONDS
)

app.include_router(healthcheck_router)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(idea_router)


Instrumentator().instrument(app).expose(app)


@app.exception_handler(AppError)
async def app_exception_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        reload=settings.UVICORN_RELOAD,
        workers=settings.UVICORN_WORKERS_COUNT
    )

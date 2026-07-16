
from fastapi import APIRouter

healthcheck_router = APIRouter(prefix="/healthcheck", tags=['Healthcheck'])

@healthcheck_router.get("/")
def healthcheck():
    return {
        "health": True
    }

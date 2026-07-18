
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from cache.cache_getter import CacheAsideEntityGetter
from cache.redis_cache_backend import RedisCacheBackend, get_redis_client
from db.database import async_session_factory
from db.unitofwork import UnitOfWork
from integrations.ai import llm_client
from schemas.user import UserReadSchema
from services.auth import AuthService
from services.idea import IdeaService
from services.idea_generation import IdeaGenerationService
from services.user import UserService


async def get_uow():
    uow = UnitOfWork(async_session_factory)
    try:
        yield uow
    finally:
        if hasattr(uow, 'session') and uow.session:
            await uow.session.close()

UOWDep = Annotated[UnitOfWork, Depends(get_uow)]

def get_redis_cache_backend() -> RedisCacheBackend:
    client = get_redis_client()
    return RedisCacheBackend(client)

RedisCacheBackendDep = Annotated[RedisCacheBackend, Depends(get_redis_cache_backend)]

def get_cache_aside_getter(cache: RedisCacheBackendDep) -> CacheAsideEntityGetter:
    return CacheAsideEntityGetter(cache)

CacheAsideGetterDep = Annotated[CacheAsideEntityGetter, Depends(get_cache_aside_getter)]

def get_user_service(uow: UOWDep, cache: RedisCacheBackendDep) -> UserService:
    return UserService(uow, cache)

UserServiceDep = Annotated[UserService, Depends(get_user_service)]

def get_auth_service(uow: UOWDep) -> AuthService:
    return AuthService(uow)

AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]

def get_idea_service(uow: UOWDep, cache: RedisCacheBackendDep, cache_getter: CacheAsideGetterDep) -> IdeaService:
    return IdeaService(uow, cache, cache_getter)

IdeaServiceDep = Annotated[IdeaService, Depends(get_idea_service)]

def get_idea_generation_service(
    uow: UOWDep,
    cache: RedisCacheBackendDep,
    cache_getter: CacheAsideGetterDep,
    idea_service: IdeaServiceDep
) -> IdeaGenerationService:
    return IdeaGenerationService(uow, cache, cache_getter, idea_service, llm_client)

IdeaGenerationServiceDep = Annotated[IdeaGenerationService, Depends(get_idea_generation_service)]


async def get_current_user(
    auth_service: AuthServiceDep,
    access_token: str | None = Cookie(default=None),
) -> UserReadSchema:
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не предоставлен access токен",
        )

    user = await auth_service.authenticate_user(access_token)
    return user

CurrentUserDep = Annotated[UserReadSchema, Depends(get_current_user)]

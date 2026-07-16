
import json

from cache.redis_cache_backend import RedisCacheBackend
from db.unitofwork import UnitOfWork
from exceptions.idea import IdeaNotFoundError, IdeaOwnershipError
from models.idea import IdeaORM
from schemas.idea import IdeaCreateSchema, IdeaReadSchema, IdeaStatsSchema, IdeaUpdateSchema


class IdeaService:
    def __init__(self, uow: UnitOfWork, cache: RedisCacheBackend):
        self.uow = uow
        self.cache = cache

    def _validate_ownership(self, idea: IdeaORM | IdeaReadSchema | None, user_id: str) -> None:
        if not idea:
            raise IdeaNotFoundError()

        if idea.user_id != user_id:
            raise IdeaOwnershipError()

    async def _remove_ideas_list_cache(self, user_id: str) -> None:
        key = f"ideas:user:{user_id}"
        await self.cache.delete(key)

    async def _remove_idea_cache(self, user_id: str, idea_id: str) -> None:
        key = f"ideas:user:{user_id}:idea:{idea_id}"
        await self.cache.delete(key)

    async def create_idea(self, data: IdeaCreateSchema, user_id: str) -> IdeaReadSchema:
        async with self.uow:
            idea_dict = {
                **data.model_dump(),
                "user_id": user_id
            }
            created_idea = await self.uow.idea_repository.create(idea_dict)
            await self.uow.commit()

        await self._remove_ideas_list_cache(user_id)
        return IdeaReadSchema.model_validate(created_idea)

    async def get_user_ideas(self, user_id: str) -> list[IdeaReadSchema]:
        key = f"ideas:user:{user_id}"
        cached_data = await self.cache.get_value(key)

        if cached_data:
            ideas_dicts = json.loads(cached_data)
            return [IdeaReadSchema.model_validate(idea) for idea in ideas_dicts]

        async with self.uow:
            ideas = await self.uow.idea_repository.get_user_ideas(user_id)
            result = [IdeaReadSchema.model_validate(idea) for idea in ideas]

        cache_value = json.dumps([idea.model_dump() for idea in result], default=str)
        await self.cache.set_value(key, cache_value, ttl=3600 * 24 * 3)

        return result

    async def get_idea_by_id(self, idea_id: str, user_id: str) -> IdeaReadSchema:
        key = f"ideas:user:{user_id}:idea:{idea_id}"
        cached_data = await self.cache.get_value(key)

        if cached_data:
            idea_dict = json.loads(cached_data)
            schema_data = IdeaReadSchema.model_validate(idea_dict)

            self._validate_ownership(schema_data, user_id)
            return schema_data

        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)

        self._validate_ownership(idea, user_id)
        result = IdeaReadSchema.model_validate(idea)

        cache_value = json.dumps(result.model_dump(), default=str)
        await self.cache.set_value(key, cache_value, ttl=3600 * 24 * 3)

        return result

    async def delete_idea(self, idea_id: str, user_id: str) -> None:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)
            self._validate_ownership(idea, user_id)

            await self.uow.idea_repository.delete(idea_id)
            await self.uow.commit()

        await self._remove_ideas_list_cache(user_id)
        await self._remove_idea_cache(user_id, idea_id)

    async def change_idea(self, idea_id: str, data: IdeaUpdateSchema, user_id: str) -> IdeaReadSchema:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)
            self._validate_ownership(idea, user_id)

            updated_idea = await self.uow.idea_repository.update(idea_id, data.model_dump())
            await self.uow.commit()

        await self._remove_ideas_list_cache(user_id)
        await self._remove_idea_cache(user_id, idea_id)

        return IdeaReadSchema.model_validate(updated_idea)

    async def get_user_ideas_stats(self, user_id: str) -> IdeaStatsSchema:
        async with self.uow:
            ideas_count = await self.uow.idea_repository.get_user_ideas_count(user_id)

        return IdeaStatsSchema(
            ideas_count=ideas_count
        )

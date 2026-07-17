
from cache.cache_getter import CacheAsideEntityGetter
from cache.redis_cache_backend import RedisCacheBackend
from db.unitofwork import UnitOfWork
from schemas.idea import IdeaCreateSchema, IdeaReadSchema, IdeaStatsSchema, IdeaUpdateSchema
from services.validators import validate_idea_ownership


class IdeaService:
    def __init__(self, uow: UnitOfWork, cache: RedisCacheBackend, cache_getter: CacheAsideEntityGetter):
        self.uow = uow
        self.cache = cache
        self.cache_getter = cache_getter

    async def _remove_ideas_list_cache(self, user_id: str) -> None:
        await self.cache.delete(f"ideas:user:{user_id}")

    async def _remove_idea_cache(self, user_id: str, idea_id: str) -> None:
        await self.cache.delete(f"ideas:user:{user_id}:idea:{idea_id}")

    async def create_idea(self, data: IdeaCreateSchema, user_id: str) -> IdeaReadSchema:
        async with self.uow:
            idea_dict = {**data.model_dump(), "user_id": user_id}
            created_idea = await self.uow.idea_repository.create(idea_dict)
            await self.uow.commit()

        await self._remove_ideas_list_cache(user_id)
        return IdeaReadSchema.model_validate(created_idea)

    async def get_user_ideas(self, user_id: str) -> list[IdeaReadSchema]:
        key = f"ideas:user:{user_id}"

        async def fetch_from_db():
            return await self.uow.idea_repository.get_user_ideas(user_id)

        return await self.cache_getter.get_entity(
            key=key,
            fetch_func=fetch_from_db,
            schema_class=IdeaReadSchema,
            ttl=3600 * 24 * 3,
            is_list=True
        )

    async def get_idea_by_id(self, idea_id: str, user_id: str) -> IdeaReadSchema:
        key = f"ideas:user:{user_id}:idea:{idea_id}"

        async def fetch_from_db():
            return await self.uow.idea_repository.get_by_id(idea_id)

        idea = await self.cache_getter.get_entity(
            key=key,
            fetch_func=fetch_from_db,
            schema_class=IdeaReadSchema,
            ttl=3600 * 24 * 3,
            is_list=False
        )

        validate_idea_ownership(idea, user_id)
        return idea

    async def delete_idea(self, idea_id: str, user_id: str) -> None:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)
            validate_idea_ownership(idea, user_id)

            await self.uow.idea_repository.delete(idea_id)
            await self.uow.commit()

        await self._remove_ideas_list_cache(user_id)
        await self._remove_idea_cache(user_id, idea_id)

    async def change_idea(self, idea_id: str, data: IdeaUpdateSchema, user_id: str) -> IdeaReadSchema:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)
            validate_idea_ownership(idea, user_id)

            updated_idea = await self.uow.idea_repository.update(idea_id, data.model_dump())
            await self.uow.commit()

        await self._remove_ideas_list_cache(user_id)
        await self._remove_idea_cache(user_id, idea_id)

        return IdeaReadSchema.model_validate(updated_idea)

    async def get_user_ideas_stats(self, user_id: str) -> IdeaStatsSchema:
        async with self.uow:
            ideas_count = await self.uow.idea_repository.get_user_ideas_count(user_id)
            generation_distribution = await self.uow.idea_repository.get_ideas_generation_distribution(user_id)

        generation_distribution_dict = {}
        for gen in generation_distribution:
            key, value = gen[2], gen[1]

            if key in generation_distribution_dict:
                generation_distribution_dict[key].append(value)
            else:
                generation_distribution_dict[key] = [value]
        
        return IdeaStatsSchema(
            ideas_count=ideas_count,
            generation_distribution=generation_distribution_dict
        )

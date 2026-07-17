
from cache.cache_getter import CacheAsideEntityGetter
from cache.redis_cache_backend import RedisCacheBackend
from db.unitofwork import UnitOfWork
from schemas.idea_generation import IdeaGenerationCreateSchema, IdeaGenerationReadSchema
from services.idea import IdeaService
from services.validators import validate_idea_generation_ownership


class IdeaGenerationService:
    def __init__(
        self,
        uow: UnitOfWork,
        cache: RedisCacheBackend,
        idea_service: IdeaService,
        cache_getter: CacheAsideEntityGetter
    ):
        self.uow = uow
        self.cache = cache
        self.idea_service = idea_service
        self.cache_getter = cache_getter

    async def _remove_generations_list_cache(self, user_id: str, idea_id: str) -> None:
        await self.cache.delete(f"ideas:user:{user_id}:idea:{idea_id}:generations")

    async def _remove_generation_cache(self, user_id: str, idea_id: str, gen_id: str) -> None:
        await self.cache.delete(f"ideas:user:{user_id}:idea:{idea_id}:generation:{gen_id}")

    async def get_idea_generations(self, idea_id: str, user_id: str) -> list[IdeaGenerationReadSchema]:
        await self.idea_service.get_idea_by_id(idea_id, user_id)

        key = f"ideas:user:{user_id}:idea:{idea_id}:generations"

        async def fetch_from_db():
            return await self.uow.idea_generation_repository.get_idea_generations(idea_id)

        return await self.cache_getter.get_entity(
            key=key,
            fetch_func=fetch_from_db,
            schema_class=IdeaGenerationReadSchema,
            ttl=3600 * 24 * 3,
            is_list=True
        )

    async def create_idea_generation(self, idea_id: str, data: IdeaGenerationCreateSchema, user_id: str) -> None:
        await self.idea_service.get_idea_by_id(idea_id, user_id)

        data_dict = {
            **data.model_dump(),
            "idea_id": idea_id,
            "result": "to be continued"
        }

        async with self.uow:
            await self.uow.idea_generation_repository.create(data_dict)
            await self.uow.commit()

        await self._remove_generations_list_cache(user_id, idea_id)

    async def get_idea_generation(self, gen_id: str, idea_id: str, user_id: str) -> IdeaGenerationReadSchema:
        idea = await self.idea_service.get_idea_by_id(idea_id, user_id)

        key = f"ideas:user:{user_id}:idea:{idea_id}:generation:{gen_id}"

        async def fetch_from_db():
            return await self.uow.idea_generation_repository.get_by_id(gen_id)

        generation = await self.cache_getter.get_entity(
            key=key,
            fetch_func=fetch_from_db,
            schema_class=IdeaGenerationReadSchema,
            ttl=3600 * 24 * 3,
            is_list=False
        )

        validate_idea_generation_ownership(generation, idea, user_id)
        return generation

    async def delete_idea_generation(self, gen_id: str, idea_id: str, user_id: str) -> None:
        idea = await self.idea_service.get_idea_by_id(idea_id, user_id)

        key = f"ideas:user:{user_id}:idea:{idea_id}:generation:{gen_id}"

        async def fetch_from_db():
            return await self.uow.idea_generation_repository.get_by_id(gen_id)

        generation = await self.cache_getter.get_entity(
            key=key,
            fetch_func=fetch_from_db,
            schema_class=IdeaGenerationReadSchema,
            ttl=3600 * 24 * 3,
            is_list=False
        )

        validate_idea_generation_ownership(generation, idea, user_id)

        async with self.uow:
            await self.uow.idea_generation_repository.delete(gen_id)
            await self.uow.commit()

        await self._remove_generations_list_cache(user_id, idea_id)
        await self._remove_generation_cache(user_id, idea_id, gen_id)

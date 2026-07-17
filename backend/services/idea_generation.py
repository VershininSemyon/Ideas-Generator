

from cache.redis_cache_backend import RedisCacheBackend
from db.unitofwork import UnitOfWork
from schemas.idea_generation import IdeaGenerationCreateSchema, IdeaGenerationReadSchema
from services.validators import validate_idea_generation_ownership, validate_idea_ownership


class IdeaGenerationService:
    def __init__(self, uow: UnitOfWork, cache: RedisCacheBackend):
        self.uow = uow
        self.cache = cache

    async def get_idea_generations(self, idea_id: str, user_id: str) -> list[IdeaGenerationReadSchema]:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)

        validate_idea_ownership(idea, user_id)

        async with self.uow:
            idea_generations = await self.uow.idea_generation_repository.get_idea_generations(idea_id)
            return [IdeaGenerationReadSchema.model_validate(idea_gen) for idea_gen in idea_generations]

    async def create_idea_generation(self, idea_id: str, data: IdeaGenerationCreateSchema, user_id: str) -> None:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)

        validate_idea_ownership(idea, user_id)

        data = {
            **data.model_dump(),
            "idea_id": idea_id,
            "result": "to be continued"
        }

        async with self.uow:
            await self.uow.idea_generation_repository.create(data)
            await self.uow.commit()

    async def get_idea_generation(self, gen_id: str, idea_id: str, user_id: str) -> IdeaGenerationReadSchema:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)

        validate_idea_ownership(idea, user_id)

        async with self.uow:
            idea_generation = await self.uow.idea_generation_repository.get_by_id(gen_id)

        validate_idea_generation_ownership(idea_generation, idea, user_id)

        return IdeaGenerationReadSchema.model_validate(idea_generation)

    async def delete_idea_generation(self, gen_id: str, idea_id: str, user_id: str) -> None:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)

        validate_idea_ownership(idea, user_id)

        async with self.uow:
            idea_generation = await self.uow.idea_generation_repository.get_by_id(gen_id)

        validate_idea_generation_ownership(idea_generation, idea, user_id)

        async with self.uow:
            await self.uow.idea_generation_repository.delete(gen_id)
            await self.uow.commit()

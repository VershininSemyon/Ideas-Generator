
from db.unitofwork import UnitOfWork
from exceptions.idea import IdeaNotFoundError, IdeaOwnershipError
from models.idea import IdeaORM
from schemas.idea import IdeaCreateSchema, IdeaReadSchema, IdeaStatsSchema, IdeaUpdateSchema


class IdeaService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def _validate_ownership(self, idea: IdeaORM | None, user_id: str) -> None:
        if not idea:
            raise IdeaNotFoundError()

        if idea.user_id != user_id:
            raise IdeaOwnershipError()

    async def create_idea(self, data: IdeaCreateSchema, user_id: str) -> IdeaReadSchema:
        async with self.uow:
            idea_dict = {
                **data.model_dump(),
                "user_id": user_id
            }
            created_idea = await self.uow.idea_repository.create(idea_dict)
            await self.uow.commit()

        return IdeaReadSchema.model_validate(created_idea)

    async def get_user_ideas(self, user_id: str) -> list[IdeaReadSchema]:
        async with self.uow:
            ideas = await self.uow.idea_repository.get_user_ideas(user_id)
            return [IdeaReadSchema.model_validate(idea) for idea in ideas]

    async def get_idea_by_id(self, idea_id: str, user_id: str) -> IdeaReadSchema:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)

        self._validate_ownership(idea, user_id)
        return IdeaReadSchema.model_validate(idea)

    async def delete_idea(self, idea_id: str, user_id: str) -> None:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)
            self._validate_ownership(idea, user_id)

            await self.uow.idea_repository.delete(idea_id)
            await self.uow.commit()

    async def change_idea(self, idea_id: str, data: IdeaUpdateSchema, user_id: str) -> IdeaReadSchema:
        async with self.uow:
            idea = await self.uow.idea_repository.get_by_id(idea_id)
            self._validate_ownership(idea, user_id)

            updated_idea = await self.uow.idea_repository.update(idea_id, data.model_dump())
            await self.uow.commit()

        return IdeaReadSchema.model_validate(updated_idea)

    async def get_user_ideas_stats(self, user_id: str) -> IdeaStatsSchema:
        async with self.uow:
            ideas_count = await self.uow.idea_repository.get_user_ideas_count(user_id)

        return IdeaStatsSchema(
            ideas_count=ideas_count
        )

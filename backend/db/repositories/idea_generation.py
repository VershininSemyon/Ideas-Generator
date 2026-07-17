
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.repositories.base import BaseRepository
from models.idea_generation import IdeaGenerationORM


class IdeaGenerationRepository(BaseRepository[IdeaGenerationORM]):
    def __init__(self, session: AsyncSession):
        super().__init__(IdeaGenerationORM, session)

    async def get_idea_generations(self, idea_id: str) -> list[IdeaGenerationORM]:
        stmt = select(IdeaGenerationORM).where(IdeaGenerationORM.idea_id == idea_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

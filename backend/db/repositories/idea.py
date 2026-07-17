
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.repositories.base import BaseRepository
from models.idea import IdeaORM
from models.idea_generation import IdeaGenerationORM


class IdeaRepository(BaseRepository[IdeaORM]):
    def __init__(self, session: AsyncSession):
        super().__init__(IdeaORM, session)

    async def get_user_ideas(self, user_id: str) -> list[IdeaORM]:
        stmt = select(IdeaORM).where(IdeaORM.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_user_ideas_count(self, user_id: str) -> int:
        stmt = select(
            func.count("id").label("ideas_count")
        ).where(IdeaORM.user_id == user_id)

        result = await self.session.execute(stmt)
        return result.scalar()

    async def get_ideas_generation_distribution(self, user_id: str):
        stmt = select(
            IdeaORM.id,
            IdeaORM.title, 
            func.count(IdeaGenerationORM.id).label("generation_count")
        ).outerjoin(
            IdeaGenerationORM, 
            IdeaORM.id == IdeaGenerationORM.idea_id
        ).where(
            IdeaORM.user_id == user_id
        ).group_by(
            IdeaORM.id
        ).order_by(
            func.count(IdeaORM.id).desc()
        )

        result = await self.session.execute(stmt)
        return result.all()

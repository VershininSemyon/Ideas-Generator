
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.repositories.base import BaseRepository
from models.idea import IdeaORM


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

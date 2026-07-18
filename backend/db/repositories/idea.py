
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

    async def get_total_ideas_count(self, user_id: str) -> int:
        stmt = (
            select(
                func.count(IdeaORM.id).label("ideas_count")
            )
            .where(IdeaORM.user_id == user_id)
        )

        result = await self.session.execute(stmt)
        return result.scalar()

    async def get_total_generations_count(self, user_id: str) -> int:
        stmt = (
            select(
                func.count(IdeaGenerationORM.id).label("generations_count")
            )
            .join(
                IdeaORM,
                IdeaORM.id == IdeaGenerationORM.idea_id
            )
            .where(IdeaORM.user_id == user_id)
        )

        result = await self.session.execute(stmt)
        return result.scalar()

    async def get_ideas_generation_count_distribution(self, user_id: str):
        stmt = (
            select(
                IdeaORM.id,
                IdeaORM.title,
                func.count(IdeaGenerationORM.id).label("generation_count")
            )
            .outerjoin(
                IdeaGenerationORM,
                IdeaORM.id == IdeaGenerationORM.idea_id
            )
            .where(
                IdeaORM.user_id == user_id
            )
            .group_by(
                IdeaORM.id
            )
            .order_by(
                func.count(IdeaORM.id).desc()
            )
        )

        result = await self.session.execute(stmt)
        return result.all()

    async def get_ideas_generation_type_distribution(self, user_id: str):
        stmt = (
            select(
                IdeaGenerationORM.type,
                func.count(IdeaGenerationORM.id).label("generation_count")
            )
            .join(
                IdeaORM,
                IdeaORM.id == IdeaGenerationORM.idea_id
            )
            .where(
                IdeaORM.user_id == user_id
            )
            .group_by(
                IdeaGenerationORM.type
            )
            .order_by(
                func.count(IdeaGenerationORM.id).desc()
            )
        )

        result = await self.session.execute(stmt)
        return result.all()

    async def get_average_generations_per_idea(self, user_id: str):
        ideas_generations_count_cte = (
            select(
                IdeaORM.id,
                func.count(IdeaGenerationORM.id).label("generation_count")
            )
            .outerjoin(
                IdeaGenerationORM,
                IdeaORM.id == IdeaGenerationORM.idea_id
            )
            .where(
                IdeaORM.user_id == user_id
            )
            .group_by(
                IdeaORM.id
            )
            .cte("ideas_generations_count_cte")
        )

        stmt = select(
            func.avg(ideas_generations_count_cte.c.generation_count).label("avg_gen_per_idea")
        )

        result = await self.session.execute(stmt)
        return float(result.scalar() or 0.0)

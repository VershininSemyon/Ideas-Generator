
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base


class TypeEnum(str, enum.Enum):
    SUMMARY = "summary"
    TAGS = "tags"
    CRITIQUE = "critique"
    EXPAND = "expand"


class IdeaGenerationORM(Base):
    __tablename__ = "idea_generations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    idea_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(Enum(TypeEnum), default=TypeEnum.SUMMARY, nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    result: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    idea: Mapped["IdeaORM"] = relationship(back_populates="idea_generations")

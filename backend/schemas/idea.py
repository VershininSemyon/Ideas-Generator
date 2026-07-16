
import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

IdeaTitle = Annotated[str, Field(max_length=50)]


class IdeaReadSchema(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: IdeaTitle
    content: str
    is_favorite: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IdeaCreateSchema(BaseModel):
    title: IdeaTitle
    content: str
    is_favorite: bool


class IdeaUpdateSchema(BaseModel):
    title: IdeaTitle
    content: str
    is_favorite: bool


class IdeaStatsSchema(BaseModel):
    ideas_count: int

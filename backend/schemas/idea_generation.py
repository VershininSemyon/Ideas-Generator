
import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class TypeEnum(str, Enum):
    SUMMARY = "summary"
    TAGS = "tags"
    CRITIQUE = "critique"
    EXPAND = "expand"


class IdeaGenerationReadSchema(BaseModel):
    id: uuid.UUID
    idea_id: uuid.UUID
    type: TypeEnum
    prompt: str
    result: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IdeaGenerationCreateSchema(BaseModel):
    type: TypeEnum
    prompt: str

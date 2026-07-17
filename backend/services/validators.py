
from exceptions.idea import IdeaNotFoundError, IdeaOwnershipError
from exceptions.idea_generation import IdeaGenerationNotFoundError, IdeaGenerationOwnershipError
from models.idea import IdeaORM
from models.idea_generation import IdeaGenerationORM
from schemas.idea import IdeaReadSchema
from schemas.idea_generation import IdeaGenerationReadSchema


def validate_idea_ownership(idea: IdeaORM | IdeaReadSchema | None, user_id: str) -> None:
    if not idea:
        raise IdeaNotFoundError()

    if idea.user_id != user_id:
        raise IdeaOwnershipError()


def validate_idea_generation_ownership(
    idea_generation: IdeaGenerationORM | IdeaGenerationReadSchema | None,
    idea: IdeaORM | IdeaReadSchema | None,
    user_id: str
):
    validate_idea_ownership(idea, user_id)

    if not idea_generation:
        raise IdeaGenerationNotFoundError()

    if idea_generation.idea_id != idea.id:
        raise IdeaGenerationOwnershipError()

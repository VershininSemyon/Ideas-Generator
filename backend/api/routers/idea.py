
import uuid

from fastapi import APIRouter, status

from api.dependencies import CurrentUserDep, IdeaGenerationServiceDep, IdeaServiceDep
from schemas.idea import IdeaCreateSchema, IdeaReadSchema, IdeaStatsSchema, IdeaUpdateSchema
from schemas.idea_generation import IdeaGenerationCreateSchema, IdeaGenerationReadSchema

idea_router = APIRouter(prefix="/ideas", tags=["Ideas"])


@idea_router.post(
    "/",
    response_model=IdeaReadSchema,
    status_code=status.HTTP_201_CREATED,
)
async def create_idea(
    data: IdeaCreateSchema,
    user: CurrentUserDep,
    idea_service: IdeaServiceDep
):
    return await idea_service.create_idea(data, user.id)


@idea_router.get(
    "/",
    response_model=list[IdeaReadSchema],
    status_code=status.HTTP_200_OK,
)
async def get_user_ideas(
    user: CurrentUserDep,
    idea_service: IdeaServiceDep
):
    return await idea_service.get_user_ideas(user.id)


@idea_router.get(
    "/stats",
    response_model=IdeaStatsSchema,
    status_code=status.HTTP_200_OK,
)
async def get_user_ideas_stats(
    user: CurrentUserDep,
    idea_service: IdeaServiceDep
):
    return await idea_service.get_user_ideas_stats(user.id)


@idea_router.get(
    "/{idea_id}",
    response_model=IdeaReadSchema,
    status_code=status.HTTP_200_OK,
)
async def get_idea_by_id(
    idea_id: uuid.UUID,
    user: CurrentUserDep,
    idea_service: IdeaServiceDep
):
    return await idea_service.get_idea_by_id(idea_id, user.id)


@idea_router.delete(
    "/{idea_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_idea(
    idea_id: uuid.UUID,
    user: CurrentUserDep,
    idea_service: IdeaServiceDep
):
    return await idea_service.delete_idea(idea_id, user.id)


@idea_router.put(
    "/{idea_id}",
    response_model=IdeaReadSchema,
    status_code=status.HTTP_200_OK,
)
async def change_idea(
    idea_id: uuid.UUID,
    data: IdeaUpdateSchema,
    user: CurrentUserDep,
    idea_service: IdeaServiceDep
):
    return await idea_service.change_idea(idea_id, data, user.id)


@idea_router.post(
    "/{idea_id}/generations",
    status_code=status.HTTP_202_ACCEPTED
)
async def create_idea_generation(
    idea_id: uuid.UUID,
    data: IdeaGenerationCreateSchema,
    user: CurrentUserDep,
    idea_generation_service: IdeaGenerationServiceDep
):
    await idea_generation_service.create_idea_generation(idea_id, data, user.id)
    return {
        "status": "success"
    }


@idea_router.get(
    "/{idea_id}/generations",
    response_model=list[IdeaGenerationReadSchema],
    status_code=status.HTTP_200_OK
)
async def get_idea_generations(
    idea_id: uuid.UUID,
    user: CurrentUserDep,
    idea_generation_service: IdeaGenerationServiceDep
):
    return await idea_generation_service.get_idea_generations(idea_id, user.id)


@idea_router.get(
    "/{idea_id}/generations/{gen_id}",
    response_model=IdeaGenerationReadSchema,
    status_code=status.HTTP_200_OK
)
async def get_idea_generation(
    idea_id: uuid.UUID,
    gen_id: uuid.UUID,
    user: CurrentUserDep,
    idea_generation_service: IdeaGenerationServiceDep
):
    return await idea_generation_service.get_idea_generation(gen_id, idea_id, user.id)


@idea_router.delete(
    "/{idea_id}/generations/{gen_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_idea_generation(
    idea_id: uuid.UUID,
    gen_id: uuid.UUID,
    user: CurrentUserDep,
    idea_generation_service: IdeaGenerationServiceDep
):
    await idea_generation_service.delete_idea_generation(gen_id, idea_id, user.id)

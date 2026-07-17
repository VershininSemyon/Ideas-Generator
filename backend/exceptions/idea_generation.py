
from exceptions.base import AppError


class IdeaGenerationError(AppError):
    status_code: int = 400
    detail: str = "Ошибка генерации идеи"


class IdeaGenerationOwnershipError(IdeaGenerationError):
    status_code: int = 403
    detail: str = "Эта генерация не принадлежит данной идеи"


class IdeaGenerationNotFoundError(IdeaGenerationError):
    status_code: int = 404
    detail: str = "Генерация идеи не найдена"

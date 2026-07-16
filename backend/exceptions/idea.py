
from exceptions.base import AppError


class IdeaError(AppError):
    status_code: int = 400
    detail: str = "Ошибка идеи"


class IdeaOwnershipError(IdeaError):
    status_code: int = 403
    detail: str = "Эта идея не принадлежит вам"


class IdeaNotFoundError(IdeaError):
    status_code: int = 404
    detail: str = "Идея не найдена"


import asyncio

from background.broker import broker
from cache.redis_cache_backend import RedisCacheBackend
from cache.redis_manager import redis_manager
from db.database import async_session_factory
from db.unitofwork import UnitOfWork
from integrations.ai import llm_client


@broker.task
async def generate_idea(gen_id: str, prompt: str, user_id: str, idea_id: str) -> str:
    try:
        ai_result = await asyncio.to_thread(llm_client.send_request_to_llm, prompt)
    except Exception as e:
        ai_result = f"Ошибка при генерации контента нейросетью: {str(e)}"

    await redis_manager.connect()
    cache = RedisCacheBackend()
    uow = UnitOfWork(async_session_factory)

    async with uow:
        await uow.idea_generation_repository.update(
            gen_id,
            {"result": ai_result}
        )
        await uow.commit()

    await cache.delete(f"ideas:user:{user_id}:idea:{idea_id}:generations")
    await cache.delete(f"ideas:user:{user_id}:idea:{idea_id}:generation:{gen_id}")

    return {
        "status": "Success",
        "idea_id": idea_id,
        "message": "Генерация успешно завершена"
    }

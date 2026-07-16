
from typing import Any

from redis import asyncio

from config.settings import settings


def get_redis_client() -> asyncio.Redis:
    return asyncio.from_url(
        settings.redis_url,
        decode_responses=True
    )


class RedisCacheBackend:
    def __init__(self, client: asyncio.Redis):
        self.client = client

    async def set_value(self, key: str, value: Any, ttl: int | None = None) -> None:
        await self.client.set(key, value, ex=ttl)

    async def increment(self, key: str) -> None:
        await self.client.incr(key)

    async def get_value(self, key: str) -> Any:
        return await self.client.get(key)

    async def ttl(self, key: str) -> int:
        return await self.client.ttl(key)

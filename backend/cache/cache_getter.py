
import json
from typing import Awaitable

from pydantic import BaseModel

from cache.redis_cache_backend import RedisCacheBackend


class CacheAsideEntityGetter:
    def __init__(self, cache: RedisCacheBackend):
        self.cache = cache

    async def get_entity(
        self,
        key: str,
        fetch_func: Awaitable,
        schema_class: type[BaseModel],
        ttl: int | None = None,
        is_list: bool = False
    ):
        cached_data = await self.cache.get_value(key)

        if cached_data:
            data = json.loads(cached_data)
            if is_list:
                return [schema_class.model_validate(el) for el in data]
            return schema_class.model_validate(data)

        entity = await fetch_func()

        if is_list and entity is None:
            entity = []
        elif not is_list and entity is None:
            return None

        if is_list:
            schema_instances = [schema_class.model_validate(e) for e in entity]
            cache_value = json.dumps([s.model_dump() for s in schema_instances], default=str)
        else:
            schema_instance = schema_class.model_validate(entity)
            cache_value = json.dumps(schema_instance.model_dump(), default=str)

        await self.cache.set_value(key, cache_value, ttl)
        return schema_instances if is_list else schema_instance

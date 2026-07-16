
import json

from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware

from cache.redis_cache_backend import RedisCacheBackend, get_redis_client


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        requests_limit: int,
        window_seconds: int
    ):
        super().__init__(app)
        self.cache = RedisCacheBackend(get_redis_client())
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds

    async def dispatch(self, request: Request, call_next):
        client_ip = request.headers.get("X-Forwarded-For") or request.client.host
        redis_key = f"rate_limit:{client_ip}"

        current_requests = await self.cache.get_value(redis_key)

        if current_requests is not None and int(current_requests) >= self.requests_limit:
            seconds_rest = await self.cache.ttl(redis_key)
            data = {
                "detail": "Слишком много запросов. Попробуйте позже.",
                "retry_after_seconds": seconds_rest
            }

            return Response(
                content=json.dumps(data),
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json"
            )

        if current_requests is None:
            await self.cache.set_value(redis_key, 1, ttl=self.window_seconds)
        else:
            await self.cache.increment(redis_key)

        response = await call_next(request)
        return response

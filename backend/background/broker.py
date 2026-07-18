
from taskiq_redis import ListQueueBroker, RedisAsyncResultBackend

from config.settings import settings

redis_options = {
    "socket_timeout": None,
    "socket_connect_timeout": 10,
    "socket_keepalive": True,
    "health_check_interval": 30,
}

broker = ListQueueBroker(
    url=settings.redis_url,
    **redis_options,
).with_result_backend(
    RedisAsyncResultBackend(
        redis_url=settings.taskiq_result_backend,
        **redis_options,
    )
)

import background.tasks

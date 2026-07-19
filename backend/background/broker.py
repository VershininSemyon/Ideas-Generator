
from taskiq_redis import ListQueueBroker, RedisAsyncResultBackend
from taskiq_dashboard import DashboardMiddleware

from config.settings import settings

redis_options = {
    "socket_timeout": None,
    "socket_connect_timeout": 10,
    "socket_keepalive": True,
    "health_check_interval": 30,
}

broker = (
    ListQueueBroker(
        url=settings.redis_url,
        **redis_options
    )
    .with_result_backend(
        RedisAsyncResultBackend(
            redis_url=settings.taskiq_result_backend,
            **redis_options
        )
    )
    .with_middlewares(
        DashboardMiddleware(
            url="http://taskiq_dashboard:8000",
            api_token=settings.TASKIQ_DASHBOARD_API_TOKEN,
            broker_name="fastapi_backend_worker"
        )
    )
)


import background.tasks

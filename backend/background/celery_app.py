
from celery import Celery

from config.settings import settings

celery_app = Celery(
    "worker",
    broker=settings.celery_result_backend,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_track_started=True,
    broker_connection_retry_on_startup=True,
)

celery_app.autodiscover_tasks(["background"])

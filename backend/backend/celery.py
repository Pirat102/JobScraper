import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")

app.config_from_object('django.conf:settings', namespace='CELERY')

app.conf.update(
    task_acks_late=True,
    task_track_started=True,
    broker_connection_retry_on_startup=True 
    
)

app.autodiscover_tasks()


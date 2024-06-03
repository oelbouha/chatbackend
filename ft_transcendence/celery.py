import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ft_transcendence.settings')

app = Celery('ft_transcendence')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

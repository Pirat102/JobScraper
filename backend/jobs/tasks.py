from django.core.management import call_command
from celery import shared_task

@shared_task
def run_scrapers_task():
    result = call_command("run_scrapers")
    return result
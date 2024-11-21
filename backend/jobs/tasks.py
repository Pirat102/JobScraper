from django.core.management import call_command
from celery import shared_task, group

@shared_task(name='scraper.justjoin')
def run_jjit():
    return call_command("run_scrapers", "--scrapers", "jjit")

@shared_task(name='scraper.nofluff')
def run_nofluff():
    return call_command("run_scrapers", "--scrapers", "nofluff")

@shared_task(name='scraper.pracuj')
def run_pracuj():
    return call_command("run_scrapers", "--scrapers", "pracuj")

@shared_task(name='scraper.protocol')
def run_protocol():
    return call_command("run_scrapers", "--scrapers", "protocol")

@shared_task
def run_scrapers_task():
    # Using group for proper parallel execution
    tasks = group([
        run_jjit.s(),
        run_nofluff.s(),
        run_pracuj.s(),
        run_protocol.s()
    ])
    tasks.apply_async()
    return "Launched all scraper tasks"
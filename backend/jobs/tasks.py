from django.core.management import call_command
from celery import shared_task
import time
from django.core.cache import cache

@shared_task
def run_scrapers_task():
    
    ## Clear cache
    redis_client = cache.client.get_client()
    cache_keys = redis_client.keys('*views.decorators.cache*')
    
    if cache_keys:
        redis_client.delete(*cache_keys)
            
    return "result"
    
    
        
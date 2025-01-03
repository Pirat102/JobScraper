from django.core.management import call_command
from celery import shared_task
import time
from django.core.cache import cache
import logging

@shared_task
def run_scrapers_task():
    logger = logging.getLogger('scraper')
    
    
    try:
        redis_client = cache.client.get_client()
        
        # Log all existing keys before clearing
        all_keys = redis_client.keys('*')
        logger.info(f"All Redis keys before clearing: {all_keys}")
        
        # Find cache keys
        cache_keys = redis_client.keys('*views.decorators.cache*')
        logger.info(f"Found cache keys to clear: {cache_keys}")
        
        if cache_keys:
            redis_client.delete(*all_keys)
            logger.info(f"Cleared {len(cache_keys)} cache keys")
            
            # Verify keys were cleared
            remaining_keys = redis_client.keys('views.decorators.cache*')
            logger.info(f"Remaining cache keys: {remaining_keys}")
        
        return "result"
        
    except Exception as e:
        logger.error(f"Failed to clear cache: {str(e)}")
        raise
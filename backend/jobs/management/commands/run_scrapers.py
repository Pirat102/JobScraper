from django.core.management.base import BaseCommand
from jobs.scrapers.justjoin_scraper import JustJoinScraper
from jobs.scrapers.nofluffjobs import NoFluffScraper
from jobs.scrapers.pracuj_scraper import PracujScraper
from jobs.scrapers.protocol_scraper import TheProtocolScraper
import logging

class Command(BaseCommand):
    help = 'Run all job scrapers'

    def add_arguments(self, parser):
        parser.add_argument(
            '--scrapers',
            nargs='+',
            type=str,
            default=['all'],
            help='Specify which scrapers to run (jjit, nofluff, or all)'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=200,
            help='Limit number of requests per scraper'
        )

    

    def handle(self, *args, **options):
        logger = logging.getLogger('scraper')
        scrapers_to_run = options['scrapers']
        request_limit = options['limit']
        
        available_scrapers = {
            'jjit': JustJoinScraper,
            'nofluff': NoFluffScraper,
            'pracuj': PracujScraper,
            'protocol': TheProtocolScraper
        }

        if 'all' in scrapers_to_run:
            scrapers_to_run = available_scrapers.keys()

        total_jobs_created = 0
        
        for scraper_name in scrapers_to_run:
            if scraper_name not in available_scrapers:
                logger.error(f"Unknown scraper: {scraper_name}")
                continue

            logger.info(f"Starting {scraper_name} scraper...")
            scraper = available_scrapers[scraper_name](request_limit=request_limit)
            
            try:
                jobs_created = scraper.run()
                if jobs_created is not None:
                    total_jobs_created += jobs_created
                    logger.info(f"{scraper_name} scraper finished. Created {jobs_created} new jobs")
                else:
                    logger.error(f"{scraper_name} scraper failed to return number of created jobs")
            except Exception as e:
                logger.error(f"Error running {scraper_name} scraper: {str(e)}", exc_info=True)

        logger.info(f"Scraping completed. Total new jobs created: {total_jobs_created}")
        return str(total_jobs_created)
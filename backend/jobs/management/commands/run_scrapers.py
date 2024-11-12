from django.core.management.base import BaseCommand
from jobs.scrapers.justjoin_scraper import JustJoinScraper
from jobs.scrapers.nofluffjobs import NoFluffScraper
import logging
import sys

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

    def setup_logging(self):
        # Create logger
        logger = logging.getLogger('scraper')
        logger.setLevel(logging.INFO)

        # Create console handler with formatting
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(formatter)

        # Add console handler to logger
        logger.addHandler(console_handler)
        return logger

    def handle(self, *args, **options):
        logger = self.setup_logging()
        scrapers_to_run = options['scrapers']
        
        available_scrapers = {
            'jjit': JustJoinScraper,
            'nofluff': NoFluffScraper
        }

        if 'all' in scrapers_to_run:
            scrapers_to_run = available_scrapers.keys()

        total_jobs_created = 0
        
        for scraper_name in scrapers_to_run:
            if scraper_name not in available_scrapers:
                self.stderr.write(
                    self.style.ERROR(f"Unknown scraper: {scraper_name}")
                )
                continue

            logger.info(f"Starting {scraper_name} scraper...")
            scraper = available_scrapers[scraper_name]()
            
            try:
                jobs_created = scraper.run()
                if jobs_created is not None:
                    total_jobs_created += jobs_created
                    logger.info(f"{scraper_name} scraper finished. Created {jobs_created} new jobs")
                else:
                    logger.error(f"{scraper_name} scraper failed to return number of created jobs")
            except Exception as e:
                logger.error(f"Error running {scraper_name} scraper: {str(e)}", exc_info=True)

        self.stdout.write(
            self.style.SUCCESS(f"Scraping completed. Total new jobs created: {total_jobs_created}")
        )
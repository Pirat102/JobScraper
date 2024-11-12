from django.core.management.base import BaseCommand
from jobs.scrapers.justjoin_scraper import JustJoinScraper
from jobs.scrapers.nofluffjobs import NoFluffScraper

class Command(BaseCommand):
    help = 'Run JustJoinIT scraper'

    def handle(self, *args, **options):
        scraper = JustJoinScraper()
        try:
            jobs_created = scraper.run()
            self.stdout.write(
                self.style.SUCCESS(f"Created {jobs_created} new jobs")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error: {e}")
            )
from django.core.management.base import BaseCommand
from django.db.models import Count
from jobs.models import Job

class Command(BaseCommand):
    help = 'Find and remove duplicate job entries, keeping the earliest instance'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry_run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        # Find groups of duplicates
        duplicates = Job.objects.values('title', 'company').\
                    annotate(count=Count('id')).\
                    filter(count__gt=1)

        total_duplicates = 0
        
        for dup in duplicates:
            # Get all jobs matching this title and company
            matching_jobs = Job.objects.filter(
                title=dup['title'],
                company=dup['company']
            ).order_by('scraped_date')  # Order by date to keep earliest
            
            # First one is the one we'll keep
            original = matching_jobs.first()
            duplicates_to_remove = matching_jobs.exclude(id=original.id)
            
            self.stdout.write(
                f"\nFound duplicates for: {dup['title']} at {dup['company']}"
                f"\nKeeping: ID {original.id} (scraped: {original.scraped_date})"
            )
            
            for job in duplicates_to_remove:
                self.stdout.write(
                    self.style.WARNING(
                        f"Will delete: ID {job.id} (scraped: {job.scraped_date})"
                    )
                )
                total_duplicates += 1
                
                if not options['dry_run']:
                    job.delete()

        if total_duplicates == 0:
            self.stdout.write(self.style.SUCCESS('\nNo duplicates found!'))
        else:
            action = 'Would delete' if options['dry_run'] else 'Deleted'
            self.stdout.write(self.style.SUCCESS(
                f'\n{action} {total_duplicates} duplicate entries.'
            ))
from django.core.management.base import BaseCommand, CommandParser
from jobs.models import Job

class Command(BaseCommand):
    help = "Update source field in Job model"
    
    
    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            '--dry_run',
            action='store_true',
            help='Show what would be done without actually updating'
        )
    
    def handle(self, *args, **options):
        jobs = Job.objects.filter(source__isnull=True)
        
        updated_count = 0
        
        for job in jobs:
            if 'pracuj.pl' in job.url:
                source = "Pracuj.pl"
            elif 'nofluffjobs.com' in job.url:
                source = "NoFluffJobs"
            elif 'justjoin.it' in job.url:
                source = "JustJoinIt"
            else:
                continue
            
            if options['dry_run']:
                self.stdout.write(f"Would update ID:{job.id}-{job.url.split('.')[1]} to source {source}")
            else:
                job.source = source
                job.save()
            updated_count += 1
            
        action = 'Would update' if options['dry_run'] else 'Updated'
        self.stdout.write(self.style.SUCCESS(f'{action} {updated_count} jobs'))
            
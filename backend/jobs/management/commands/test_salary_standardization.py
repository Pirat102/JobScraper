from django.core.management.base import BaseCommand
from jobs.models import Job
from jobs.utils.salary_standardizer import standardize_salary

class Command(BaseCommand):
    help = 'Test salary standardization on existing database entries'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Actually apply the changes instead of just showing them'
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit the number of records to process'
        )

    def handle(self, *args, **options):
        jobs = Job.objects.exclude(salary__isnull=True).exclude(salary='')
        
        if options['limit']:
            jobs = jobs[:options['limit']]
            
        total = jobs.count()
        changes = 0
        
        self.stdout.write(f"Processing {total} jobs with salary information")
        self.stdout.write("-" * 50)

        for job in jobs:
            old_salary = job.salary
            new_salary = standardize_salary(old_salary)
            
            if old_salary != new_salary:
                changes += 1
                self.stdout.write(
                    f"Job ID: {job.id}\n"
                    f"Title: {job.title}\n"
                    f"Old salary: {old_salary}\n"
                    f"New salary: {new_salary}\n"
                    f"{'-' * 30}"
                )
                
                if options['apply']:
                    job.salary = new_salary
                    job.save()
        
        if options['apply']:
            action = "Updated"
        else:
            action = "Would update"
            
        self.stdout.write(self.style.SUCCESS(
            f"\nSummary:\n"
            f"Total jobs processed: {total}\n"
            f"{action} {changes} salaries"
        ))
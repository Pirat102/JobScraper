from django.core.management.base import BaseCommand
from jobs.models import Job
from django.db import transaction

class Command(BaseCommand):
    help = 'One-time cleanup of salary formats in the database. Convert EUR to PLN and remove decimal values (100,00 > 100)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry_run',
            action='store_true',
            help='Run without making actual changes'
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write('Running in dry-run mode - no changes will be made')
            
        # Get all jobs with salaries
        jobs = Job.objects.exclude(salary__isnull=True).exclude(salary='')
        total_jobs = jobs.count()
        
        self.stdout.write(f'Found {total_jobs} jobs with salary information')
        
        updated_count = 0
        eur_converted = 0
        decimal_cleaned = 0
        
        try:
            with transaction.atomic():
                for job in jobs:
                    original_salary = job.salary
                    updated_salary = original_salary
                    
                    # 1. Handle EUR conversion
                    if 'EUR' in updated_salary:
                        parts = updated_salary.replace('EUR', '').strip().split('-')
                        min_val = float(parts[0].strip().replace(' ', ''))
                        max_val = float(parts[1].strip().replace(' ', ''))
                        
                        # Convert to PLN
                        min_val = int(min_val * 4.30)
                        max_val = int(max_val * 4.30)
                        
                        # Format with spaces for thousands
                        updated_salary = f"{min_val:,} - {max_val:,} PLN".replace(',', ' ')
                        eur_converted += 1
                    
                    # 2. Remove decimal parts
                    if ',' in updated_salary:
                        parts = updated_salary.split('-')
                        min_val = parts[0].split(',')[0].strip()
                        max_val = parts[1].split(',')[0].strip()
                        updated_salary = f"{min_val} - {max_val} PLN"
                        decimal_cleaned += 1
                    
                    if updated_salary != original_salary:
                        if not dry_run:
                            job.salary = updated_salary
                            job.save()
                        updated_count += 1
                        self.stdout.write(
                            f'Updated: "{original_salary}" -> "{updated_salary}"'
                        )
                
                if dry_run:
                    self.stdout.write(
                        self.style.WARNING(
                            '\nDry run completed. No changes were made.'
                        )
                    )
                    raise transaction.TransactionManagementError("Dry run - rolling back changes")
                    
        except transaction.TransactionManagementError as e:
            if "Dry run" not in str(e):
                self.stdout.write(
                    self.style.ERROR(
                        'Error occurred. All changes have been rolled back.'
                    )
                )
                raise
                
        # Print summary
        self.stdout.write(self.style.SUCCESS(
            f'\nSummary:\n'
            f'Total jobs processed: {total_jobs}\n'
            f'Jobs updated: {updated_count}\n'
            f'EUR conversions: {eur_converted}\n'
            f'Decimal parts removed: {decimal_cleaned}'
        ))
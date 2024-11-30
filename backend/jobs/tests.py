from django.test import TestCase
from jobs.models import Job

class JobTestCase(TestCase):
    def setUp(self):
        
        self.job = Job.objects.create(
            title="Software Engineer",
            company="Google",
            location="Warszawa",
            operating_mode="Remote",
            salary="80 000 - 100 000 PLN",
            skills={"Python": "regular", "Django": "junior"},
            description="This is a software engineering role.",
            url="https://justjoin.it/job-posting",
            summary="software engineering role."
    )

        # Assert that the job was created correctly
    def test_job_creation(self):
        self.assertEqual(self.job.title, "Software Engineer")
        self.assertEqual(self.job.company, "Google")
        self.assertEqual(self.job.location, "Warszawa")
        self.assertEqual(self.job.operating_mode, "Remote")
        self.assertEqual(self.job.salary, "80 000 - 100 000 PLN")
        self.assertEqual(self.job.skills, {"Python": "regular", "Django": "junior"})
        self.assertEqual(self.job.description, "This is a software engineering role.")
        self.assertEqual(self.job.url,"https://justjoin.it/job-posting")
        self.assertIsNotNone(self.job.scraped_date)
        self.assertEqual(self.job.summary, "software engineering role.")


from jobs.utils.salary_standardizer import standardize_salary

class TestSalaryStandardizer(TestCase):
    def test_hourly_salary_conversion(self):
        """Test that hourly salaries are converted to monthly"""
        test_cases = [
            ("100 - 140 PLN", "16 800 - 23 520 PLN"),
            ("90 - 120 PLN", "15 120 - 20 160 PLN"),
        ]
        
        for input_salary, expected in test_cases:
            with self.subTest(input_salary=input_salary):
                result = standardize_salary(input_salary)
                self.assertEqual(result, expected)
    
    def test_monthly_salary_standardization(self):
        """Test that monthly salaries are properly standardized"""
        test_cases = [
            ("10 000 - 15 000 PLN", "10 000 - 15 000 PLN"),
            ("10000  -  15000 PLN", "10 000 - 15 000 PLN"),
            ("10000-15000 PLN", "10 000 - 15 000 PLN"),
            
        ]
        
        for input_salary, expected in test_cases:
            with self.subTest(input_salary=input_salary):
                result = standardize_salary(input_salary)
                self.assertEqual(result, expected)
    
    def test_edge_cases(self):
        """Test edge cases and invalid inputs"""
        test_cases = [
            ("", ""),  # Empty string
            ("invalid salary", "invalid salary"),  # Invalid format
            ("10 000 PLN", "10 000 PLN"),
            ("12 000  PLN", "12 000 PLN"),# No range
        ]
        
        for input_salary, expected in test_cases:
            with self.subTest(input_salary=input_salary):
                result = standardize_salary(input_salary)
                self.assertEqual(result, expected)
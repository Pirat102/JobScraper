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

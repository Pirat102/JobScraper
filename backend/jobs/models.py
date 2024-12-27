from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Job(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    operating_mode = models.CharField(max_length=15, null=True, blank=True)
    salary = models.CharField(max_length=25, blank=True, null=True)
    experience = models.CharField(max_length=25)
    skills = models.JSONField()
    description = models.TextField(null=True, blank=True)
    url = models.URLField()
    scraped_date = models.DateTimeField(default=timezone.now)
    summary = models.TextField(null=True, blank=True)
    source = models.CharField(max_length=20, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"ID: {self.id} - Title: {self.title}"
    
    class Meta:
        ordering = ['-scraped_date']
        
    def get_sorted_skills(self):
        """
        Returns skills sorted by level priority and then alphabetically.
        Format: {skill: level}
        """
        level_priority = {
            'master': 6,
            'advanced': 5,
            'senior': 4,
            'regular': 3,
            'junior': 2,
            'nice to have': 1
        }
        
        # Convert skills dict to list of tuples for sorting
        skills_list = list(self.skills.items())
        
        # Sort first by level priority (descending) then by skill name (ascending)
        sorted_skills = sorted(
            skills_list,
            key=lambda x: (-level_priority.get(x[1].lower(), 0), x[0])
        )
        
        return dict(sorted_skills)
    
    
class Requested(models.Model):
    url = models.URLField()
    title = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    
    def __str__(self):
        return f"ID: {self.id} - Title: {self.title} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
    
    
class JobApplication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    applied_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=20,
        choices=[
            ('APPLIED', 'Applied'),
            ('INTERVIEWING', 'Interviewing'),
            ('REJECTED', 'Rejected'),
            ('ACCEPTED', 'Accepted'),
        ],
        default='APPLIED'
    )

    class Meta:
        # Ensure a user can't apply to the same job twice
        unique_together = ['user', 'job']
        ordering = ['-applied_date']
        
class ApplicationNote(models.Model):
    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=timezone.now)

    class Meta:
        ordering = ['-created_at']
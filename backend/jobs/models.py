from django.db import models
from django.utils import timezone


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
    

    def __str__(self):
        return f"ID: {self.id} - Title: {self.title}"
    
    
class Requested(models.Model):
    url = models.URLField()
    title = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    
    def __str__(self):
        return f"ID: {self.id} - Title: {self.title} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
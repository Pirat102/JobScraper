from django.db import models

class Job(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    skills = models.JSONField()
    url = models.URLField()
    scraped_date = models.DateTimeField(auto_now_add=True)
    summary = models.TextField(null=True, blank=True)

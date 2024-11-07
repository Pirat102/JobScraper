from django.db import models


class Job(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    operating_mode = models.CharField(max_length=15, null=True, blank=True)
    salary = models.CharField(max_length=25, blank=True, null=True)
    skills = models.JSONField()
    description = models.TextField(null=True, blank=True)
    url = models.URLField()
    scraped_date = models.DateTimeField(auto_now_add=True)
    summary = models.TextField(null=True, blank=True)
    



    def __str__(self):
        return f"ID: {self.id} - Title: {self.title}"
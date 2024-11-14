from django.contrib import admin
from jobs.models import *


class JobView(admin.ModelAdmin):
    list_display = ("id", 'title', 'company', 'salary', 'experience', 'skills')


# Register your models here.
admin.site.register(Job, JobView)
admin.site.register(Requested)
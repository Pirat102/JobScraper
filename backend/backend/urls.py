from django.contrib import admin
from django.urls import path
from jobs.api import api

urlpatterns = [
    path('management/', admin.site.urls),
    path("api/", api.urls),
]

from django.contrib import admin
from django.urls import include, path
from jobs.api import api
from debug_toolbar.toolbar import debug_toolbar_urls

urlpatterns = [
    path('management/', admin.site.urls),
    path("api/", api.urls),
] + debug_toolbar_urls() 


from ninja import Schema, FilterSchema
from typing import Optional, List
from django.db.models import Q
from datetime import datetime, date


class ErrorSchema(Schema):
    message: str
    
class UserRegistrationSchema(Schema):
    username: str
    password: str
    email: Optional[str] = None

class JobSchema(Schema):
    id: int
    title: str
    company: Optional[str]
    location: Optional[str]
    operating_mode: Optional[str]
    salary: Optional[str]
    experience: Optional[str]
    skills: dict  
    url: str
    scraped_date: datetime
    summary: Optional[str]
    source: Optional[str]
    

class JobFilterSchema(FilterSchema):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    scraped_date: Optional[date] = None
    experience: Optional[str] = None
    operating_mode: Optional[str] = None
    salary: Optional[str] = None
    skills: Optional[List[str]] = None
    source: Optional[str] = None

    def filter_queryset(self, queryset):
        filters = {
            'title__icontains': self.title,
            'location__icontains': self.location,
            'scraped_date__gt': self.scraped_date,
            'experience__icontains': self.experience,
            'operating_mode__icontains': self.operating_mode,
            'source__icontains': self.source
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        queryset = queryset.filter(**filters)

        # Custom filter logic for skills (AND logic)
        if self.skills:
            skills_query = Q()
            for skill in self.skills:
                skills_query &= Q(skills__has_key=skill)
            queryset = queryset.filter(skills_query)
        
        return queryset
    
class ApplicationNoteSchema(Schema):
    id: Optional[int] = None
    content: str
    created_at: datetime
    updated_at: datetime

class JobApplicationSchema(Schema):
    id: int
    job: JobSchema
    applied_date: datetime
    status: str
    notes: List[ApplicationNoteSchema]
    
class UpdateStatusSchema(Schema):
    status: str
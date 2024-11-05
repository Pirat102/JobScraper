from ninja import Schema, ModelSchema, FilterSchema
from jobs.models import Job
from typing import Optional

class Error(Schema):
    message: str

class JobSchema(ModelSchema):
    class Meta:
        model = Job
        fields = ('title', 'company', 'location', 'operating_mode', 'salary', 'skills', 'url', 'scraped_date', 'summary')
        
class JobFilterSchema(FilterSchema):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    operating_mode: Optional[str] = None
    salary: Optional[str] = None
    skills: Optional[str] = None
    scraped_date: Optional[str] = None
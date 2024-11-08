from ninja import Schema, ModelSchema, FilterSchema
from jobs.models import Job
from pydantic import Field
from typing import Optional

class ErrorSchema(Schema):
    message: str
    
class UserSchema(Schema):
    username: str
    password: str
    email: Optional[str]

class JobSchema(Schema):
    title: str
    company: Optional[str]
    location: Optional[str]
    operating_mode: Optional[str]
    salary: Optional[str]
    skills: dict  
    url: str
    scraped_date: str
    summary: Optional[str]
    
    @staticmethod
    def resolve_scraped_date(obj):
        if obj.scraped_date:
            return obj.scraped_date.strftime("%Y-%m-%d %H:%M")
        return None
    

class JobFilterSchema(FilterSchema):
    title: Optional[str] = Field(None, q='title__icontains')
    company: Optional[str] = Field(None, q='company__icontains')
    location: Optional[str] = Field(None, q='location__icontains')
    operating_mode: Optional[str] = Field(None, q='operating_mode__icontains')
    salary: Optional[str] = Field(None, q='salary__icontains')
    skills: Optional[str] = Field(None, q='skills__icontains')
    

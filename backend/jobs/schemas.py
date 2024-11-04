from ninja import Schema, ModelSchema
from jobs.models import Job

class Error(Schema):
    message: str

class JobSchema(ModelSchema):
    class Meta:
        model = Job
        fields = ('title', 'company', 'location', 'operating_mode', 'salary', 'skills', 'url', 'scraped_date', 'summary')
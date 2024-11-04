from ninja import ModelSchema
from jobs.models import Job

class JobSchema(ModelSchema):
    class Meta:
        model = Job
        fields = ('title', 'company', 'location', 'description', 'skills', 'url', 'scraped_date', 'summary')
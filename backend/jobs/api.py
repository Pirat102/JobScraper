from ninja import NinjaAPI, Query
from jobs.models import Job
from jobs.schemas import JobSchema, JobFilterSchema
from typing import Optional


api = NinjaAPI()

@api.get("jobs/", response=list[JobSchema])
def get_jobs(request):
    return Job.objects.all()

@api.get("job/{id}", response=JobSchema)
def get_job(request, id: int):
    return Job.objects.filter(pk=id).first()

@api.get("jobs/filter/", response=list[JobSchema])
def list_jobs(request, filters: JobFilterSchema=Query(...)):
    jobs = Job.objects.all()
    jobs = filters.filter(jobs)
    return jobs
    
    

                



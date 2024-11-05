from ninja import NinjaAPI, Query
from jobs.models import Job
from jobs.schemas import JobSchema, JobFilterSchema


api = NinjaAPI()

@api.get("jobs/", response=list[JobSchema])
def get_jobs(request):
    return Job.objects.all()

@api.get("job/{id}", response=JobSchema)
def get_job(request, id: int):
    return Job.objects.filter(pk=id).first()


    

                



from ninja import Query, Form
from jobs.models import Job
from jobs.schemas import *
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_extra import NinjaExtraAPI, api_controller, route
from ninja_jwt.authentication import JWTAuth

api = NinjaExtraAPI(csrf=True)


@api.post("/register")
def register(request, user_data: UserRegistrationSchema):
    if User.objects.filter(username=user_data.username).exists():
        return {"success": False, "message": "Username already exists"}
    
    User.objects.create(
        username=user_data.username,
        password=make_password(user_data.password)
    )
    return {"success": True, "message": "Username registered succesfully"}

@api_controller
class JobController:
    
    @route.get("jobs/", response=list[JobSchema])
    def get_jobs(self, request):
        return Job.objects.all().order_by("-scraped_date")

    @route.get("job/{id}", response=JobSchema)
    def get_job(self, request, id: int):
        return Job.objects.filter(pk=id).first()

    @route.get("jobs/filter/", response=list[JobSchema], auth=JWTAuth())
    def list_jobs(self, request, filters: JobFilterSchema=Query(...)):
        jobs = Job.objects.all()
        jobs = filters.filter(jobs)
        return jobs.order_by("-scraped_date")
    
    
    
    
api.register_controllers(NinjaJWTDefaultController, JobController)

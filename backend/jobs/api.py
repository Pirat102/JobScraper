from ninja import Query
from typing import Dict
from jobs.models import Job
from jobs.schemas import *
from django.contrib.auth.models import User
from ninja_extra.permissions import AllowAny
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_extra import NinjaExtraAPI, api_controller, route
from ninja_jwt.authentication import JWTAuth

api = NinjaExtraAPI()


@api_controller('/auth', tags=['Authentication'], permissions=[AllowAny])
class AuthController:

    @route.post('register', response={201: Dict, 400: Dict})
    def register(self, user_data: UserRegistrationSchema) -> Dict:
        if User.objects.filter(username=user_data.username).exists():
            return 400, {"success": False, "message": "Username already exists"}
        
        User.objects.create_user(
            username=user_data.username,
            password=user_data.password
        )
        return 201, {"success": True, "message": "Registration successful"}

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
        jobs = filters.filter_queryset(jobs)
        return jobs.order_by("-scraped_date")
    
    
    
    
api.register_controllers(NinjaJWTDefaultController, AuthController, JobController)

from collections import Counter
from datetime import datetime, timedelta, time
from django.shortcuts import get_object_or_404
from ninja import Query
from typing import Dict, Any
from jobs.models import Job, JobApplication, ApplicationNote
from jobs.schemas import *
from django.contrib.auth.models import User
from ninja_extra.permissions import AllowAny
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_extra import NinjaExtraAPI, api_controller, route
from ninja_jwt.authentication import JWTAuth
from ninja_extra.pagination import paginate, PageNumberPaginationExtra, PaginatedResponseSchema
from jobs.utils.salary_standardizer import average_salary
from django.utils import timezone
from django.db.models import Exists, OuterRef, Subquery
from django.views.decorators.cache import cache_page
from ninja.decorators import decorate_view

api = NinjaExtraAPI()

@api_controller('/auth', tags=['Authentication'], permissions=[AllowAny])
class AuthController:

    @route.post('register', response={200: Dict, 401: Dict})
    def register(self, user_data: UserRegistrationSchema) -> Dict:
        if not user_data.username or not user_data.password:
            return 401, {"success": False, "message": "Username and password are required"}
        
        if User.objects.filter(username=user_data.username).exists():
            return 401, {"success": False, "message": "Username already exists"}
        
        try:
            User.objects.create_user(
                username=user_data.username,
                password=user_data.password
            )
            return 200, {"success": True, "message": "Registration successful"}
        except Exception:
            return 401, {"success": False, "message": "Invalid registration data"}

@api_controller("/jobs")
class JobController:
    @route.get("", response=PaginatedResponseSchema[JobSchema])
    @paginate(PageNumberPaginationExtra, page_size=25)
    def get_jobs(self):
        return Job.objects.all()
    
    
    @route.get("stats", response=Dict[str, Any])
    @decorate_view(cache_page(60 * 60))
    def stats(self):
        today = timezone.make_aware(datetime.combine(datetime.now().date(), time.min))
        last_week = today - timedelta(days=7)
        last_two_weeks = today - timedelta(days=14)
        last_month = today - timedelta(days=30)
        jobs = Job.objects.defer('description', 'url', 'location', 'title', 'summary', 'company', 'scraped_date', )
        
    
        skill_freq = {}
        exp_stats = Counter()
        source_stats = Counter()
        work_mode = Counter()
        salary_count = 0
        min_total = 0
        max_total = 0
        today_jobs = 0
        last_week_jobs = 0
        last_two_weeks_jobs = 0
        last_month_jobs = 0
        
        for job in jobs:
            # Process all stats in single loop
            exp_stats[job.experience] += 1
            source_stats[job.source] += 1
            work_mode[job.operating_mode] += 1
            
            for skill in job.skills.keys():
                skill_freq[skill] = skill_freq.get(skill, 0) + 1
            
            if job.salary:
                min_value, max_value = average_salary(job.salary)
                min_total += min_value
                max_total += max_value
                salary_count += 1
            
            if job.created_at > today:
                today_jobs +=1
            if job.created_at > last_week:
                last_week_jobs +=1
            if job.created_at > last_two_weeks:
                last_two_weeks_jobs +=1
            if job.created_at > last_month:
                last_month_jobs +=1
                
        if salary_count > 0:
            avg_min = min_total / salary_count
            avg_max = max_total / salary_count
            salary = f"{int(avg_min)} - {int(avg_max)} PLN"
        else:
            salary = ""
            
        
        def sort_dict(d):
            return dict(sorted(d.items(), key=lambda x: x[1], reverse=True))
        
    
        return {
            "top_skills": sort_dict(skill_freq),
            "exp_stats": sort_dict(exp_stats),
            "source_stats": sort_dict(source_stats), 
            "operating_mode_stats": sort_dict(work_mode),
            "salary_stats": salary,
            "trends": {
                "today": today_jobs,
                "last_7_days": last_week_jobs,
                "last_14_days": last_two_weeks_jobs,
                "last_30_days": last_month_jobs,
        },
        }
    

    @route.get("/filter", response=PaginatedResponseSchema[JobSchema])
    @paginate(PageNumberPaginationExtra, page_size=25)
    @decorate_view(cache_page(60 * 60))
    def list_jobs(self, request, filters: JobFilterSchema=Query(...)):
        jobs = Job.objects.defer('description', 'created_at')
        print("Request received:", request.path)
        
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                jwt_auth = JWTAuth()
                user = jwt_auth.authenticate(request, token)
                
                if user:
                    # Annotate both has_applied and application_id
                    applications_subquery = JobApplication.objects.filter(
                        job_id=OuterRef('id'),
                        user=user
                    )
                    jobs = jobs.annotate(
                        has_applied=Exists(applications_subquery),
                        application_id=Subquery(
                            applications_subquery.values('id')[:1]
                        )
                    )
            except Exception as e:
                print(f"Authentication failed: {e}")
                pass
        jobs = filters.filter_queryset(jobs)
        return jobs
    
    
    # Light endpoint for fetching dates and top skills on jobs page
    @route.get("filter-options", response=Dict[str, Any])
    @decorate_view(cache_page(60 * 60 * 24))
    def get_filter_options(self):
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Get top skills 
        jobs = Job.objects.filter(scraped_date__gte=thirty_days_ago).only('skills', 'scraped_date')
        skills = {}
        for job in jobs:
            for skill in job.skills.keys():
                skills[skill] = skills.get(skill, 0) + 1
        top_skills = sorted(skills.items(), key=lambda x: x[1], reverse=True)[:10]
        top_skills = [skill[0] for skill in top_skills]

        # Get dates
        dates = (jobs
                .dates('scraped_date', 'day', 'DESC')
                .distinct())
        
        data = {
            "top_skills": top_skills,
            "available_dates": list(dates),
        }

        return data
    

@api_controller("/applications", auth=JWTAuth())
class JobApplicationController:
    @route.post("", response={200: JobApplicationSchema, 400: Dict})
    def create_application(self, request, payload: CreateApplicationSchema):
        try:
            job = Job.objects.get(id=payload.job_id)
        except Exception as e:
            return 400, {"success": False, f"message {payload}": f"Job not found {payload.id}"}
        
        if JobApplication.objects.filter(user=request.user, job_id=payload.job_id):
            return 400, {"success": False, "message": "Already applied to this job"}
        
        application = JobApplication.objects.create(
            user = request.user,
            job_id=payload.job_id
        )
        return application
        
    @route.get("", response=List[JobApplicationSchema])
    def get_user_applications(self, request):
        
        return JobApplication.objects.filter(user=request.user)
        
    @route.post("{application_id}/notes", response=ApplicationNoteSchema)
    def add_note(self, request, application_id: int, note_data: ApplicationNoteSchema):
        application = get_object_or_404(JobApplication, id=application_id, user=request.user)
        note = ApplicationNote.objects.create(
            application=application,
            content=note_data.content
        )
        return note
    
    @route.patch("{application_id}", response=JobApplicationSchema)
    def update_application_status(self, request, application_id: int, status_data: UpdateStatusSchema):
        application = get_object_or_404(JobApplication, id=application_id, user=request.user)
        application.status = status_data.status
        application.save()
        return application
    
    @route.delete("{application_id}", response={200: Dict, 404: Dict})
    def delete_application(self, request, application_id: int):
        application = get_object_or_404(JobApplication, id=application_id, user=request.user)
        application.delete()
        return 200, {"success": True, "message": "Application deleted"}
    
    @route.delete("{application_id}/notes/{note_id}", response={200: Dict, 404: Dict})
    def delete_note(self, request, note_id: int, application_id):
        application = get_object_or_404(JobApplication, id=application_id, user=request.user)
        note = get_object_or_404(ApplicationNote, application=application, id=note_id)
        note.delete()
        return 200, {"success": True, "message": "Note deleted"}
        
        
    

    
    
api.register_controllers(NinjaJWTDefaultController, AuthController, JobController, JobApplicationController)

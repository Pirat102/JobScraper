from ninja import NinjaAPI
from jobs.models import Job
from jobs.schemas import JobSchema
from ninja import UploadedFile, File

api = NinjaAPI()

@api.get("/add")
def add(request, a: int, b:int):
    return {"result": a + b}

@api.post("/jobs")
def create_job(request, payload: JobSchema, data: UploadedFile = File(...)):
    payload_dict = payload.dict()
    job = Job(**payload_dict)
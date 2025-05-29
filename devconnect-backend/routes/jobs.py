from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Job, User
from auth import get_current_user

router = APIRouter()

class JobCreate(BaseModel):
    title: str
    description: str
    tech_stack: str
    budget: str
    timeline: str

@router.post("/jobs", status_code=201)
def create_job(job: JobCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    uid = current_user["uid"]
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user or user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can post jobs")

    new_job = Job(
        title=job.title,
        description=job.description,
        tech_stack=job.tech_stack,
        budget=job.budget,
        timeline=job.timeline,
        client_id=user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return {"message": "Job posted", "job_id": new_job.id}

@router.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    return jobs

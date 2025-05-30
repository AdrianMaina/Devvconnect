from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from .auth import get_current_user  # Fixed import path for routes folder
from models import Job, Proposal, User
from schemas import JobCreate
from typing import List

router = APIRouter()

@router.post("/jobs")
def create_job(job: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can post jobs.")
    new_job = Job(
        title=job.title,
        description=job.description,
        budget=job.budget,
        tech_stack=job.tech_stack,
        timeline=job.timeline,
        client_id=current_user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()

@router.get("/some-protected-route")
def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello, {current_user.name}"}


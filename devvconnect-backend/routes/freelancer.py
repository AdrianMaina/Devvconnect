from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .auth import get_current_user, get_db  # your existing dependency functions
from models import User, Job, Proposal  # your models

router = APIRouter(
    prefix="/freelancer",
    tags=["freelancer"],
)

@router.get("/jobs")
def list_available_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Logic to fetch jobs available to freelancers
    jobs = db.query(Job).filter(Job.is_open == True).all()
    return jobs

@router.post("/apply/{job_id}")
def apply_to_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user is a freelancer
    if current_user.role != "freelancer":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Logic to apply to a job
    existing_proposal = db.query(Proposal).filter(
        Proposal.job_id == job_id,
        Proposal.user_id == current_user.id
    ).first()

    if existing_proposal:
        raise HTTPException(status_code=400, detail="Already applied")

    proposal = Proposal(job_id=job_id, user_id=current_user.id, status="pending")
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return {"message": "Application submitted", "proposal": proposal}

@router.get("/approved-jobs")
def get_approved_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Return jobs where the user has been approved
    approved_proposals = db.query(Proposal).filter(
        Proposal.user_id == current_user.id,
        Proposal.status == "approved"
    ).all()
    return approved_proposals

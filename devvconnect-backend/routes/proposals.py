from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from .auth import get_current_user  # Fixed import path
from models import Proposal, Job, User
from schemas import ProposalCreate
from typing import List

router = APIRouter()

@router.post("/proposals")
def create_proposal(proposal: ProposalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can apply to jobs.")
    
    existing_proposal = db.query(Proposal).filter_by(job_id=proposal.job_id, freelancer_id=current_user.id).first()
    if existing_proposal:
        raise HTTPException(status_code=400, detail="Proposal already submitted.")

    new_proposal = Proposal(
        job_id=proposal.job_id,
        freelancer_id=current_user.id,
        cover_letter=proposal.cover_letter,  # Use cover_letter from schema
        status="pending"
    )
    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)
    return new_proposal

@router.get("/freelancer/approved-jobs")
def get_approved_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can access approved jobs.")

    approved_proposals = db.query(Proposal).filter_by(freelancer_id=current_user.id, status="approved").all()
    job_ids = [p.job_id for p in approved_proposals]
    jobs = db.query(Job).filter(Job.id.in_(job_ids)).all()
    return jobs

@router.get("/some-protected-route")
def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello, {current_user.name}"}
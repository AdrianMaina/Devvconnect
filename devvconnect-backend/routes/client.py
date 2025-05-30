from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .auth import get_current_user, get_db
from models import User, Job, Proposal
from schemas import JobCreate

router = APIRouter(
    prefix="/client",
    tags=["client"],
)

@router.post("/jobs")
def create_job(job: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user is a client
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create new job
    new_job = Job(
        title=job.title,
        description=job.description,
        budget=job.budget,
        client_id=current_user.id,
        is_open=True
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("/jobs")
def get_client_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user is a client
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get jobs posted by this client
    jobs = db.query(Job).filter(Job.client_id == current_user.id).all()
    return jobs

@router.get("/jobs-with-proposals")
def get_jobs_with_proposals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user is a client
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get jobs with their proposals
    jobs = db.query(Job).filter(Job.client_id == current_user.id).all()
    
    result = []
    for job in jobs:
        proposals = db.query(Proposal).filter(Proposal.job_id == job.id).all()
        
        # Add freelancer info to proposals
        proposals_with_freelancer = []
        for proposal in proposals:
            freelancer = db.query(User).filter(User.id == proposal.user_id).first()
            proposal_dict = {
                "id": proposal.id,
                "job_id": proposal.job_id,
                "user_id": proposal.user_id,
                "status": proposal.status,
                "approved": proposal.status == "approved",
                "freelancer_name": freelancer.name if freelancer else "Unknown"
            }
            proposals_with_freelancer.append(proposal_dict)
        
        job_dict = {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "budget": job.budget,
            "proposals": proposals_with_freelancer
        }
        result.append(job_dict)
    
    return result

@router.post("/proposals/{proposal_id}/approve")
def approve_proposal(proposal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user is a client
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get the proposal
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check if the job belongs to this client
    job = db.query(Job).filter(Job.id == proposal.job_id).first()
    if not job or job.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to approve this proposal")
    
    # Approve the proposal
    proposal.status = "approved"
    db.commit()
    db.refresh(proposal)
    
    return {"message": "Proposal approved", "proposal": proposal}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Job, Proposal, User
from .auth import get_current_user  # Fixed import path for routes folder

router = APIRouter()

@router.get("/client/jobs-with-proposals")
def get_jobs_with_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can view their job proposals.")
    
    jobs = db.query(Job).filter(Job.client_id == current_user.id).all()
    result = []

    for job in jobs:
        job_data = {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "budget": job.budget,
            "proposals": [],
        }
        
        # Get proposals for this job
        proposals = db.query(Proposal).filter(Proposal.job_id == job.id).all()
        for proposal in proposals:
            # Get freelancer info
            freelancer = db.query(User).filter(User.id == proposal.freelancer_id).first()
            job_data["proposals"].append({
                "id": proposal.id,
                "freelancer_name": freelancer.name if freelancer else "Unknown",
                "approved": proposal.status == "approved",  # Convert status to boolean
            })
        
        result.append(job_data)

    return result

@router.post("/client/proposals/{proposal_id}/approve")
def approve_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can approve proposals.")
    
    # Get the proposal
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Verify the proposal belongs to the client's job
    job = db.query(Job).filter(Job.id == proposal.job_id, Job.client_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=403, detail="You can only approve proposals for your own jobs")
    
    # Update proposal status
    proposal.status = "approved"
    db.commit()
    
    return {"message": "Proposal approved successfully"}

@router.get("/client/jobs")
def get_client_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can access this")

    jobs = db.query(Job).filter(Job.client_id == current_user.id).all()
    return jobs
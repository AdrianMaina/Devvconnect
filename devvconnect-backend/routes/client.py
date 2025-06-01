from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .auth import get_current_user, get_db
from models import User, Job, Proposal
from schemas import JobCreate # Assuming JobCreate might be used for other client routes, keeping it

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
    # Note: Assuming JobCreate schema might not have tech_stack and timeline,
    # or they are optional and default to None if not provided by JobCreate.
    # The Job model allows them to be nullable.
    new_job = Job(
        title=job.title,
        description=job.description,
        budget=job.budget,
        tech_stack=getattr(job, 'tech_stack', None), # Safely access tech_stack
        timeline=getattr(job, 'timeline', None),   # Safely access timeline
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
    for job_item in jobs: # Renamed job to job_item to avoid conflict with models.Job
        proposals_query = db.query(Proposal).filter(Proposal.job_id == job_item.id).all()
        
        proposals_with_freelancer = []
        for proposal_item in proposals_query: # Renamed proposal to proposal_item
            # Fetch freelancer using proposal_item.freelancer_id
            freelancer = db.query(User).filter(User.id == proposal_item.freelancer_id).first()
            proposal_dict = {
                "id": proposal_item.id,
                "job_id": proposal_item.job_id,
                "freelancer_id": proposal_item.freelancer_id, # Corrected: use freelancer_id
                "status": proposal_item.status,
                # The 'approved' key in ClientDashboard.jsx proposal object comes from proposal.approved
                # Your proposal_dict creates 'approved' based on status.
                # The ClientDashboard.jsx uses 'proposal.approved', so ensure this matches.
                # The ClientDashboard.jsx also uses `handleApprove(proposal.id)`, passing the proposal's own ID.
                "approved": proposal_item.status == "approved", 
                "freelancer_name": freelancer.name if freelancer else "Unknown"
                # Other fields from Proposal model if needed by frontend:
                # "hourly_rate": proposal_item.hourly_rate,
                # "estimated_timeline": proposal_item.estimated_timeline,
                # "message": proposal_item.message,
            }
            proposals_with_freelancer.append(proposal_dict)
        
        job_dict = {
            "id": job_item.id,
            "title": job_item.title,
            "description": job_item.description,
            "budget": job_item.budget,
            "proposals": proposals_with_freelancer
        }
        result.append(job_dict)
    
    return result

@router.post("/proposals/{proposal_id}/approve")
def approve_proposal_route(proposal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)): # Renamed function
    # Check if user is a client
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get the proposal
    proposal_to_approve = db.query(Proposal).filter(Proposal.id == proposal_id).first() # Renamed variable
    if not proposal_to_approve:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check if the job belongs to this client
    job_of_proposal = db.query(Job).filter(Job.id == proposal_to_approve.job_id).first() # Renamed variable
    if not job_of_proposal or job_of_proposal.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to approve this proposal")
    
    # Approve the proposal
    proposal_to_approve.status = "approved"
    db.commit()
    db.refresh(proposal_to_approve)
    
    return {"message": "Proposal approved", "proposal": proposal_to_approve}
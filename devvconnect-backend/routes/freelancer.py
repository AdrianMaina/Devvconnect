from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
# Use .auth for get_current_user if it's defined there and get_db if it's there too
# Or import directly from database if get_db is there.
from .auth import get_current_user 
from database import get_db # Assuming get_db is in database.py
from models import User, Job, Proposal
from typing import List, Dict, Any # For type hinting

router = APIRouter(
    prefix="/freelancer",
    tags=["freelancer"],
)

@router.get("/jobs")
def list_available_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"\n--- Request to /freelancer/jobs ---")
    if current_user:
        print(f"list_available_jobs: User accessing -> ID: {current_user.id}, Email: '{current_user.email}', Role: '{current_user.role}'")
    else:
        print(f"list_available_jobs: current_user is None (authentication failed)")
        # This should ideally be caught by get_current_user
        raise HTTPException(status_code=401, detail="Authentication failed")

    jobs = db.query(Job).filter(Job.is_open == True).all()
    print(f"list_available_jobs: Found {len(jobs)} open jobs.")
    return jobs

@router.post("/apply/{job_id}")
def apply_to_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"\n--- Request to /freelancer/apply/{job_id} ---")
    if current_user:
        print(f"apply_to_job: User applying -> ID: {current_user.id}, Email: '{current_user.email}', Role: '{current_user.role}'")
    else:
        print(f"apply_to_job: current_user is None (authentication failed)")
        raise HTTPException(status_code=401, detail="Authentication failed")

    if current_user.role != "freelancer":
        print(f"Role check FAILED for /freelancer/apply. User role is '{current_user.role}'. Expected 'freelancer'.")
        raise HTTPException(status_code=403, detail="Not authorized")
    print(f"Role check PASSED for /freelancer/apply. User '{current_user.email}' has role 'freelancer'.")

    existing_proposal = db.query(Proposal).filter(
        Proposal.job_id == job_id,
        Proposal.freelancer_id == current_user.id
    ).first()

    if existing_proposal:
        print(f"apply_to_job: User {current_user.email} already applied to job {job_id}.")
        raise HTTPException(status_code=400, detail="Already applied")

    proposal = Proposal(
        job_id=job_id, 
        freelancer_id=current_user.id
        # status will default to "pending" as per the model
        # You might want to allow sending other proposal details (message, rate, etc.) in the request body
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    print(f"apply_to_job: Proposal created with ID {proposal.id} for job {job_id} by freelancer {current_user.email}.")
    return {"message": "Application submitted", "proposal": proposal}

@router.get("/approved-jobs", response_model=List[Dict[str, Any]]) # Added response_model for clarity
def get_approved_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"\n--- Request to /freelancer/approved-jobs ---")
    if current_user:
        print(f"get_approved_jobs: User accessing -> ID: {current_user.id}, Email: '{current_user.email}', Role: '{current_user.role}'")
    else:
        print(f"get_approved_jobs: current_user is None (authentication failed).")
        raise HTTPException(status_code=401, detail="Authentication failed")

    if current_user.role != "freelancer":
        print(f"Role check FAILED for /freelancer/approved-jobs. User role is '{current_user.role}'. Expected 'freelancer'.")
        raise HTTPException(status_code=403, detail="Not authorized")
    
    print(f"Role check PASSED for /freelancer/approved-jobs. User '{current_user.email}' has role 'freelancer'.")
        
    approved_proposals = db.query(Proposal).filter(
        Proposal.freelancer_id == current_user.id,
        Proposal.status == "approved"
    ).all()
    
    print(f"get_approved_jobs: Found {len(approved_proposals)} approved proposals for user {current_user.email}.")

    # MODIFICATION: Return job details instead of just proposal objects
    approved_jobs_details = []
    for proposal in approved_proposals:
        job = db.query(Job).filter(Job.id == proposal.job_id).first()
        if job:
            approved_jobs_details.append({
                "id": job.id, # Using job.id as the primary identifier for the job card
                "title": job.title,
                "description": job.description,
                "budget": job.budget,
                "tech_stack": job.tech_stack,
                "timeline": job.timeline,
                "proposal_id": proposal.id, # Include proposal ID if needed
                "proposal_status": proposal.status # Could be useful for display
            })
        else:
            print(f"get_approved_jobs: Warning - Job with ID {proposal.job_id} not found for proposal {proposal.id}")
            
    print(f"get_approved_jobs: Returning {len(approved_jobs_details)} approved job details.")
    return approved_jobs_details
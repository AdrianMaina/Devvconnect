from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Proposal, User, Job
from auth import get_current_user

router = APIRouter()

class ProposalCreate(BaseModel):
    job_id: int
    hourly_rate: str
    estimated_timeline: str
    message: str

@router.post("/proposals", status_code=201)
def submit_proposal(proposal: ProposalCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    uid = current_user["uid"]
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user or user.role != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can submit proposals")

    job = db.query(Job).filter(Job.id == proposal.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    new_proposal = Proposal(
        job_id=proposal.job_id,
        hourly_rate=proposal.hourly_rate,
        estimated_timeline=proposal.estimated_timeline,
        message=proposal.message,
        freelancer_id=user.id
    )
    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)
    return {"message": "Proposal submitted", "proposal_id": new_proposal.id}

@router.get("/proposals/{job_id}")
def get_proposals(job_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    uid = current_user["uid"]
    user = db.query(User).filter(User.firebase_uid == uid).first()
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not user or job.client_id != user.id:
        raise HTTPException(status_code=403, detail="Only the job owner can view proposals")

    proposals = db.query(Proposal).filter(Proposal.job_id == job_id).all()
    return proposals

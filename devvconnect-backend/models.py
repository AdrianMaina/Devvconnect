from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String)  # "client" or "freelancer"

    jobs = relationship("Job", back_populates="client")
    proposals = relationship("Proposal", back_populates="freelancer")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    budget = Column(Float, nullable=False)
    tech_stack = Column(String, nullable=True)
    timeline = Column(String, nullable=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_open = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("User", back_populates="jobs")
    proposals = relationship("Proposal", back_populates="job")
    
class Proposal(Base):
    __tablename__ = "proposals"
    
    id = Column(Integer, primary_key=True, index=True)
    hourly_rate = Column(String, nullable=True) # Made nullable as it's not always set in freelancer.py
    estimated_timeline = Column(String, nullable=True) # Made nullable
    message = Column(String, nullable=True) # Made nullable
    
    job_id = Column(Integer, ForeignKey("jobs.id"))
    freelancer_id = Column(Integer, ForeignKey("users.id")) # This is the correct field for the user ID
    status = Column(String, default="pending") # Added status field

    job = relationship("Job", back_populates="proposals")
    freelancer = relationship("User", back_populates="proposals")
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
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
    title = Column(String, index=True)
    description = Column(String)
    tech_stack = Column(String)
    budget = Column(String)
    timeline = Column(String)

    client_id = Column(Integer, ForeignKey("users.id"))
    client = relationship("User", back_populates="jobs")
    proposals = relationship("Proposal", back_populates="job")

class Proposal(Base):
    __tablename__ = "proposals"
    id = Column(Integer, primary_key=True, index=True)
    hourly_rate = Column(String)
    estimated_timeline = Column(String)
    message = Column(String)

    job_id = Column(Integer, ForeignKey("jobs.id"))
    freelancer_id = Column(Integer, ForeignKey("users.id"))

    job = relationship("Job", back_populates="proposals")
    freelancer = relationship("User", back_populates="proposals")

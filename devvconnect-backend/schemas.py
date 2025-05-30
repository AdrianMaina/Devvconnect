from pydantic import BaseModel, EmailStr
from typing import Optional

# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    firebase_uid: str

class UserRead(UserBase):
    id: int
    firebase_uid: str

    class Config:
        from_attributes = True  # for Pydantic V2

# Job schemas
class JobBase(BaseModel):
    title: str
    description: Optional[str] = None
    budget: float
    tech_stack: Optional[str] = None  # Make optional
    timeline: Optional[str] = None    # Make optional

class JobCreate(BaseModel):
    title: str
    description: str
    budget: float
    tech_stack: Optional[str] = None  # Optional fields to match frontend
    timeline: Optional[str] = None

class JobRead(JobBase):
    id: int
    client_id: int

    class Config:
        from_attributes = True

# Proposal schemas
class ProposalBase(BaseModel):
    job_id: int
    freelancer_id: int
    cover_letter: str

class ProposalCreate(ProposalBase):
    pass  # extend if you want, otherwise just reuse base

class ProposalRead(ProposalBase):
    id: int

    class Config:
        from_attributes = True  # Pydantic v2 syntax for ORM compatibility
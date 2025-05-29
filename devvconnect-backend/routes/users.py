from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User
from auth import get_current_user

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: str
    role: str  # "client" or "freelancer"

@router.post("/users", status_code=201)
def create_user(user_data: UserCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    uid = current_user["uid"]
    existing_user = db.query(User).filter(User.firebase_uid == uid).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        firebase_uid=uid,
        name=user_data.name,
        email=user_data.email,
        role=user_data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created", "user_id": user.id}

@router.get("/me")
def get_me(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    uid = current_user["uid"]
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }

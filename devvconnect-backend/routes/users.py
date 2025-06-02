# File: devvconnect-backend/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Header, Request # Added Request
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserRead
from firebase_admin import auth as firebase_auth_admin # Consistent alias
from typing import Optional
from .auth import get_current_user # This is the critical dependency

router = APIRouter(tags=["users"])

# verify_firebase_token - keeping as is from your file, though not used by /me
def verify_firebase_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    token = authorization.split("Bearer ")[-1]
    try:
        decoded_token = firebase_auth_admin.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Error in verify_firebase_token: {e}") # Added logging
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Firebase ID token: {e}")

@router.get("/{firebase_uid}", response_model=UserRead)
def get_user_by_firebase_uid(firebase_uid: str, db: Session = Depends(get_db), token_data=Depends(verify_firebase_token)):
    print(f"--- /users/{{firebase_uid}}: Attempting to fetch user by UID: {firebase_uid} ---")
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        print(f"--- /users/{{firebase_uid}}: User NOT FOUND with UID: {firebase_uid} ---")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    print(f"--- /users/{{firebase_uid}}: User FOUND: {user.email} ---")
    return user

@router.post("/", response_model=UserRead) # Ensure your frontend calls /users/ (with trailing slash) or adjust this
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    print(f"--- /users POST: Received user creation request for email: {user.email}, UID: {user.firebase_uid}, Role: {user.role} ---")
    
    existing_user_by_email = db.query(User).filter(User.email == user.email).first()
    if existing_user_by_email:
        print(f"--- /users POST: Email {user.email} already registered (UID: {existing_user_by_email.firebase_uid}). Aborting. ---")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{user.email}' already registered."
        )

    existing_user_by_uid = db.query(User).filter(User.firebase_uid == user.firebase_uid).first()
    if existing_user_by_uid:
        print(f"--- /users POST: Firebase UID {user.firebase_uid} already registered (Email: {existing_user_by_uid.email}). Aborting. ---")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Firebase UID '{user.firebase_uid}' already exists."
        )

    try:
        new_user = User(
            name=user.name, 
            email=user.email, 
            role=user.role,
            firebase_uid=user.firebase_uid
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"--- /users POST: User {new_user.email} (UID: {new_user.firebase_uid}) created successfully in DB with ID {new_user.id} ---")
        return new_user
    except Exception as e:
        db.rollback()
        print(f"--- /users POST: DATABASE ERROR during user creation for {user.email}: {e} ---")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not create user in database: {e}"
        )

@router.get("/me", response_model=UserRead)
def get_logged_in_user(current_user: User = Depends(get_current_user)):
    # This log will only appear if Depends(get_current_user) SUCCEEDS
    print(f"--- /users/me endpoint: Successfully resolved current_user: ID={current_user.id}, Email='{current_user.email}', Role='{current_user.role}' ---")
    return current_user
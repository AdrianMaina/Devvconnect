# File: devvconnect-backend/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database import get_db # get_db is used by create_user and get_user_by_firebase_uid
from models import User
from schemas import UserCreate, UserRead
from firebase_admin import auth as firebase_auth_admin # Renamed to avoid conflict if you alias in auth.py
from typing import Optional
from .auth import get_current_user

router = APIRouter(tags=["users"])

# verify_firebase_token function remains the same...
def verify_firebase_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    token = authorization.split("Bearer ")[-1]
    try:
        # Use the same alias for firebase_admin.auth as in your auth.py for consistency
        decoded_token = firebase_auth_admin.verify_id_token(token) 
        return decoded_token
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Firebase ID token")

# get_user_by_firebase_uid function remains the same...
@router.get("/{firebase_uid}", response_model=UserRead)
def get_user_by_firebase_uid(firebase_uid: str, db: Session = Depends(get_db), token_data=Depends(verify_firebase_token)):
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

# create_user function remains the same (ensure it has the detailed logging we discussed before)...
@router.post("/", response_model=UserRead) # Consider changing path to "/users/" if main.py uses prefix "/users"
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    print(f"--- /users POST: Attempting to create user: {user.email}, UID: {user.firebase_uid} ---")
    existing_user_email = db.query(User).filter(User.email == user.email).first()
    if existing_user_email:
        print(f"--- /users POST: Email {user.email} already registered for UID {existing_user_email.firebase_uid} ---")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    existing_user_uid = db.query(User).filter(User.firebase_uid == user.firebase_uid).first()
    if existing_user_uid:
        print(f"--- /users POST: Firebase UID {user.firebase_uid} already registered for email {existing_user_uid.email} ---")
        # Decide if this should be an error or if you should return the existing user
        # For now, let's assume a new UID should always be a new user record in your DB tied to that UID
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Firebase UID already exists")

    new_user = User(
        name=user.name, 
        email=user.email, 
        role=user.role,
        firebase_uid=user.firebase_uid
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"--- /users POST: User {new_user.email} created successfully in DB with ID {new_user.id} ---")
    return new_user


@router.get("/me", response_model=UserRead) # UserRead schema implies you return a full user object
def get_logged_in_user(
    current_user: User = Depends(get_current_user)
    # db: Session = Depends(get_db) # This 'db' dependency is not used in this function's body
):
    # ADD THIS PRINT STATEMENT:
    print(f"--- /users/me: Successfully resolved current_user: ID={current_user.id}, Email='{current_user.email}', Role='{current_user.role}' ---")
    # The response_model=UserRead will automatically serialize current_user (which is a User model instance)
    # into the UserRead schema. So, returning current_user directly is often preferred.
    return current_user 
    # Or if you want to be explicit and match your previous structure:
    # return {
    #     "id": current_user.id,
    #     "firebase_uid": current_user.firebase_uid, # Add if UserRead expects it and it's not there by default
    #     "name": current_user.name,
    #     "email": current_user.email,
    #     "role": current_user.role,
    # }
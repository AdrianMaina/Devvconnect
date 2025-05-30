from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db  # your DB session dependency
from models import User
from utils import verify_firebase_token  # helper function to verify Firebase token

router = APIRouter()

# For extracting token from Authorization header
security = HTTPBearer()

class LoginRequest(BaseModel):
    id_token: str

class UserResponse(BaseModel):
    id: int
    firebase_uid: str
    name: str
    email: str
    role: str

@router.post("/login", response_model=UserResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Verify Firebase ID token
    try:
        decoded_token = verify_firebase_token(request.id_token)
        firebase_uid = decoded_token['uid']
        email = decoded_token.get('email')
        name = decoded_token.get('name') or email.split('@')[0]
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Firebase token")

    # Check if user exists in DB
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()

    if not user:
        # Create user record in backend DB, default role can be 'freelancer' or sent from frontend in real app
        user = User(firebase_uid=firebase_uid, email=email, name=name, role='freelancer')
        db.add(user)
        db.commit()
        db.refresh(user)

    return user

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        decoded_token = verify_firebase_token(token)
        firebase_uid = decoded_token['uid']
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Firebase token")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user

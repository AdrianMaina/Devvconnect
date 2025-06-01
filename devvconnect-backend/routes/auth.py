from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import firebase_admin
from firebase_admin import auth as firebase_auth_admin, credentials

from database import get_db
from models import User
# Assuming your firebase_auth.py initializes Firebase Admin SDK
# If firebase_auth.py contains the initialization, ensure it's imported to run.
# For example, if firebase_auth.py has the cred and initialize_app lines at module level:
import firebase_auth # This will execute firebase_auth.py

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # Path for token generation, adjust if you have one

# This is a simplified get_current_user.
# Your actual implementation might vary based on how firebase_auth.py is structured.
# Ensure that firebase_admin.initialize_app() has been called once (e.g., in firebase_auth.py or main.py)
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"---------------------------------------------------------")
        print(f"get_current_user: Received token (first 20 chars): {token[:20]}...")
        # Verify the ID token using Firebase Admin SDK
        decoded_token = firebase_auth_admin.verify_id_token(token, check_revoked=True)
        firebase_uid = decoded_token.get("uid")
        print(f"get_current_user: Firebase UID from token: {firebase_uid}")
        if firebase_uid is None:
            print(f"get_current_user: Firebase UID is None in decoded token.")
            raise credentials_exception
    except firebase_admin.auth.RevokedIdTokenError:
        print(f"get_current_user: Firebase ID token has been revoked.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="ID token has been revoked.")
    except firebase_admin.auth.UserDisabledError:
        print(f"get_current_user: Firebase user account is disabled.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is disabled.")
    except firebase_admin.auth.InvalidIdTokenError as e:
        print(f"get_current_user: Invalid Firebase ID token: {e}")
        raise credentials_exception
    except Exception as e: # Catch any other Firebase or general exceptions
        print(f"get_current_user: An unexpected error occurred during token verification: {e}")
        raise credentials_exception

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if user is None:
        print(f"get_current_user: User with Firebase UID {firebase_uid} not found in local DB.")
        raise HTTPException(status_code=404, detail="User not found in local DB")
    
    print(f"get_current_user: User fetched from DB -> ID: {user.id}, Email: '{user.email}', Role: '{user.role}'")
    print(f"---------------------------------------------------------")
    return user

# Example of a login route if you were to implement one that issues your own JWTs (not directly used by Firebase Bearer tokens)
# For Firebase, the token is usually obtained on the client-side and sent as a Bearer token.
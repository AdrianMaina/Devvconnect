# File: devvconnect-backend/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
# from jose import JWTError, jwt # Not used in this specific get_current_user for Firebase tokens
import firebase_admin
from firebase_admin import auth as firebase_auth_admin # Aliased to avoid conflicts
# from firebase_admin import credentials # Not directly used here if firebase_auth.py initializes

from database import get_db
from models import User
# Assuming your separate 'firebase_auth.py' file handles SDK initialization.
# Importing it ensures its top-level code (initialization) runs.
import firebase_auth as firebase_auth_initializer_module 

router = APIRouter()

# OAuth2PasswordBearer extracts the token from the "Authorization: Bearer <token>" header.
# The tokenUrl is for OpenAPI documentation; not directly used by this Firebase token verification.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") 

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # This very first print will tell us if the function is entered at all with a token from the dependency.
    print(f"====== get_current_user: ENTERED. Token received by oauth2_scheme (first 20 chars if str): {token[:20] if token and isinstance(token, str) else 'TOKEN IS NONE or NOT A STRING'} ======")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials (token is invalid, expired, or revoked).",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_not_found_in_db_exception = HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail="User not found in local DB after successful token verification."
    )

    if not token or not isinstance(token, str): # Extra check if token wasn't provided by scheme
        print(f"====== get_current_user: Token provided by oauth2_scheme is problematic (None or not string). Raising 401. ======")
        raise credentials_exception

    try:
        print(f"-------------------get_current_user (inside try)-----------------------")
        print(f"Attempting to verify Firebase ID token (first 20 chars): {token[:20]}...")
        
        # Verify the ID token using Firebase Admin SDK
        decoded_token = firebase_auth_admin.verify_id_token(token, check_revoked=True)
        firebase_uid = decoded_token.get("uid")
        
        if firebase_uid is None:
            print(f"Firebase UID is None in decoded token. Decoded token: {decoded_token}")
            raise credentials_exception # Should be caught by the more generic exception below if this happens
        
        print(f"Successfully verified token. Firebase UID from token: '{firebase_uid}'")

    except firebase_admin.auth.RevokedIdTokenError:
        print(f"Firebase ID token has been revoked for UID: {decoded_token.get('uid', 'unknown') if 'decoded_token' in locals() else 'unknown'}.")
        raise credentials_exception 
    except firebase_admin.auth.UserDisabledError:
        print(f"Firebase user account is disabled for UID: {decoded_token.get('uid', 'unknown') if 'decoded_token' in locals() else 'unknown'}.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is disabled.")
    except firebase_admin.auth.InvalidIdTokenError as e:
        print(f"Invalid Firebase ID token received: {e}")
        raise credentials_exception
    except Exception as e: 
        # This will catch other errors during token verification, like network issues to Firebase, etc.
        print(f"An unexpected error occurred during Firebase token verification: {type(e).__name__} - {e}")
        raise credentials_exception

    # If token verification was successful and firebase_uid was extracted:
    print(f"Querying database for user with firebase_uid: '{firebase_uid}'")
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()

    if user is None:
        print(f"User with firebase_uid '{firebase_uid}' NOT FOUND in local database.")
        print("-------------------get_current_user END (User Not Found in DB)-----")
        raise user_not_found_in_db_exception
    
    print(f"User with firebase_uid '{firebase_uid}' FOUND in database: ID={user.id}, Email='{user.email}', Role='{user.role}'")
    print("-------------------get_current_user END (User Found)---------")
    return user

# Note: This auth.py does not define any routes itself if it's only for the get_current_user dependency.
# The router = APIRouter() might be unused here if no routes like /token are defined in this file.
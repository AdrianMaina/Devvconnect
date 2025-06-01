import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Depends, Header
import os
import json

# Initialize Firebase Admin SDK
# Prioritize initializing from JSON string in environment variable for production
cred_json_str = os.getenv("FIREBASE_CREDENTIALS_JSON")
app_initialized = False

if cred_json_str:
    try:
        cred_json = json.loads(cred_json_str)
        cred = credentials.Certificate(cred_json)
        firebase_admin.initialize_app(cred)
        app_initialized = True
        print("Firebase Admin initialized from FIREBASE_CREDENTIALS_JSON.")
    except Exception as e:
        print(f"Error initializing Firebase from JSON string: {e}")
        # Fallback or error, depending on your strategy
        pass # Potentially raise an error if this is critical for production

# Fallback for local development if not initialized and FIREBASE_CREDENTIALS (path) is set
if not app_initialized:
    cred_path = os.getenv("FIREBASE_CREDENTIALS") # e.g., "./firebase.json" from your .env
    if cred_path:
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred) # Default app
            app_initialized = True
            print(f"Firebase Admin initialized from file path: {cred_path}.")
        except Exception as e:
            print(f"Error initializing Firebase from file path '{cred_path}': {e}")
    else:
        # This case means neither FIREBASE_CREDENTIALS_JSON nor FIREBASE_CREDENTIALS (path) was effectively used.
        # This might be an issue if Firebase is critical.
        print("Firebase Admin SDK not initialized. Ensure FIREBASE_CREDENTIALS_JSON (for production)"
              " or FIREBASE_CREDENTIALS (path, for local) environment variable is set correctly.")


async def verify_token(authorization: str = Header(None)): # Changed to Header(None) for flexibility, can add checks
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
        
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header, must start with Bearer")
    
    token = authorization.split("Bearer ")[1]

    if not app_initialized:
        raise HTTPException(status_code=500, detail="Firebase Admin SDK not initialized. Check server configuration.")

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token  # includes email, uid, etc.
    except firebase_admin.auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token")
    except Exception as e:
        # Log the exception e for more details on the server if needed
        raise HTTPException(status_code=401, detail="Invalid or expired token")
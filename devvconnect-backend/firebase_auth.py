import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Depends, Header

# Initialize Firebase Admin SDK (only once)
cred = credentials.Certificate("firebase.json")  # replace with your actual path
firebase_admin.initialize_app(cred)

async def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    
    token = authorization.split("Bearer ")[1]

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token  # includes email, uid, etc.
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

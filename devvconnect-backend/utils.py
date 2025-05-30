import firebase_admin
from firebase_admin import auth, credentials

# Initialize Firebase Admin once (do this early in your app)
if not firebase_admin._apps:
    cred = credentials.Certificate("path/to/firebase-service-account.json")
    firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token: str):
    decoded_token = auth.verify_id_token(id_token)
    return decoded_token

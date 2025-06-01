from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from firebase_auth import verify_token # Assuming firebase_auth.py is in the same directory or accessible in PYTHONPATH
from routes import users, jobs, proposals, auth, client, freelancer # Ensure these route files exist
from database import Base, engine # Ensure database.py and engine are correctly set up
import models # Ensure models.py is correctly set up
import os

# Create database tables if they don't exist
# This is okay for development, but for production, you might use Alembic migrations
Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS Configuration ---
# Default origins for local development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Get allowed origins for production from environment variable
# The value should be the full URL of your deployed frontend (e.g., "https://yourfrontend.onrender.com")
# If you have multiple production frontend URLs, you can set them as a comma-separated string
# e.g., "https://app1.com,https://app2.com"
cors_allowed_origins_env = os.getenv("CORS_ALLOWED_ORIGINS")
if cors_allowed_origins_env:
    # If the environment variable contains multiple origins, split them by comma
    # and add to the list. Otherwise, add the single origin.
    additional_origins = [origin.strip() for origin in cors_allowed_origins_env.split(',')]
    origins.extend(additional_origins)
    # Remove duplicates just in case
    origins = list(set(origins)) 

print(f"Configured CORS origins: {origins}") # For debugging startup

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use the dynamically configured list
    allow_credentials=True,
    allow_methods=["*"],    # Allows all methods
    allow_headers=["*"],    # Allows all headers
)

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(jobs.router, tags=["Jobs"]) # Add prefix if needed, e.g., prefix="/jobs"
app.include_router(proposals.router, prefix="/proposals", tags=["Proposals"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(client.router, tags=["Client"]) # Add prefix if needed
app.include_router(freelancer.router, tags=["Freelancer"]) # Add prefix if needed


# --- Example Protected Route ---
@app.get("/protected", tags=["Protected"])
async def protected_route(user_data: dict = Depends(verify_token)):
    return {"message": f"Hello {user_data.get('email', 'user')}! This is a protected route."}

# --- Root Endpoint (Optional, good for health checks) ---
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the DevvConnect API!"}


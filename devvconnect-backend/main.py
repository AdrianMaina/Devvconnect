from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from firebase_auth import verify_token
from routes import users, jobs, proposals, auth, client  # your route modules
from database import Base, engine


# Create all tables (if not already created)
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS - adjust origins as needed
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",  # React frontend default
    # Add more origins if your frontend is hosted elsewhere
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Correct prefixes for each router
app.include_router(users.router, prefix="/users")
app.include_router(jobs.router)
app.include_router(proposals.router, prefix="/proposals", tags=["Proposals"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(client.router)

# Example of a protected route
@app.get("/protected")
def protected_route(user_data: dict = Depends(verify_token)):
    return {"message": f"Hello {user_data['email']}!"}

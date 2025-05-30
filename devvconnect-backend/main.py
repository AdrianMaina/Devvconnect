from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from firebase_auth import verify_token
from routes import users, jobs, proposals, auth, client, freelancer  # assume you have a freelancer.py router
from database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users")
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(proposals.router, prefix="/proposals", tags=["Proposals"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(client.router, prefix="/client", tags=["Client"])


@app.get("/protected")
def protected_route(user_data: dict = Depends(verify_token)):
    return {"message": f"Hello {user_data['email']}!"}

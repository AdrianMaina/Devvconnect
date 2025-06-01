	
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session # Session is used by get_db type hint
# fastapi.Depends is not used in this file directly, but often associated with get_db usage in routes
# from fastapi import Depends 

# Get the database URL from the environment variable
DATABASE_URL_FROM_ENV = os.getenv("DATABASE_URL")
SQLALCHEMY_DATABASE_URL = ""  # Initialize

# Default connect_args. Will be populated only for SQLite.
connect_args = {}

if DATABASE_URL_FROM_ENV:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL_FROM_ENV
    # Check if it's a PostgreSQL URL (common for Render and other cloud providers)
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        # Replace 'postgres://' with 'postgresql://' for SQLAlchemy compatibility
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
        print(f"INFO: Using PostgreSQL database. Connection URL (modified for SQLAlchemy): {SQLALCHEMY_DATABASE_URL}")
        # PostgreSQL does not need 'check_same_thread': False
    elif SQLALCHEMY_DATABASE_URL.startswith("sqlite:///"):
        print(f"INFO: Using SQLite database from DATABASE_URL: {SQLALCHEMY_DATABASE_URL}")
        connect_args = {"check_same_thread": False} # For SQLite only
    else:
        # For other database types, you might need specific handling or connect_args
        print(f"INFO: Using database from DATABASE_URL: {SQLALCHEMY_DATABASE_URL}")
else:
    print("WARNING: DATABASE_URL environment variable not found.")
    print("         Falling back to local SQLite database: sqlite:///./dev.db")
    print("         Ensure DATABASE_URL is set in your production environment (e.g., on Render).")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./dev.db"
    connect_args = {"check_same_thread": False} # For SQLite only

# Ensure that a database URL was actually determined
if not SQLALCHEMY_DATABASE_URL:
    # This case should ideally not be reached if the fallback logic is sound,
    # but it's a good final check.
    print("CRITICAL ERROR: SQLALCHEMY_DATABASE_URL is not configured. Application cannot start.")
    raise ValueError("SQLALCHEMY_DATABASE_URL is not configured. Set the DATABASE_URL environment variable.")

# Create the SQLAlchemy engine
# The connect_args will be empty {} for PostgreSQL or populated for SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

# Create a SessionLocal class to generate database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

# Dependency to get a DB session in FastAPI routes
def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# Devvconnect

Devvconnect is a full-stack platform designed to connect clients with skilled freelancers for various projects. Clients can post job opportunities, and freelancers can browse and apply for these jobs by submitting proposals.

## Features

* **User Authentication:** Secure user registration and login for clients and freelancers using Firebase Authentication.
* **Role-Based Access:** Distinct dashboards and functionalities for "Client" and "Freelancer" roles.
* **Client Features:**
    * Post new jobs with details like title, description, budget, tech stack, and timeline.
    * View and manage jobs they have posted.
    * Receive and review proposals from freelancers for their jobs.
    * Approve freelancer proposals.
* **Freelancer Features:**
    * Browse and search for available jobs.
    * Submit proposals for jobs.
    * View jobs they have been approved for.

## Technologies Used

### Backend
* **Framework:** FastAPI (Python)
* **ASGI Server:** Uvicorn
* **Database ORM:** SQLAlchemy
* **Database:** PostgreSQL (hosted on Render)
* **Authentication:** Firebase Admin SDK (for token verification)
* **Token Handling:** `python-jose[cryptography]`
* **Data Validation:** Pydantic (used by FastAPI)
* **Environment Variables:** `python-dotenv`
* **Dependencies:** See `devvconnect-backend/requirements.txt`

### Frontend
* **Framework/Library:** React (with Vite)
* **Authentication:** Firebase Client SDK
* **Routing:** React Router
* **Styling:** Tailwind CSS
* **API Calls:** Native `fetch` API (as seen in `src/api/api.js`)
* **Dependencies:** See `devvconnect-frontend/package.json`

## Project Structure (Simplified)
That's absolutely fantastic news that your login is finally working! Congratulations on persevering through all the debugging steps – it's paid off! 🎉

Let's address your questions:

1. If I close my pgAdmin App will my backend continue working?

Yes, absolutely! Your backend will continue working perfectly fine if you close pgAdmin.

pgAdmin is a database client/management tool. Think of it like a web browser for your database. You use it to connect to, view, and manage your database.
Your PostgreSQL database server is running independently on Render.
Your backend application (on Render) connects directly to this database server.
Closing pgAdmin on your computer simply closes your personal connection/view to the database. It does not affect the database server itself or your backend application's ability to connect to and use the database. So, feel free to close pgAdmin whenever you're not actively using it.

2. Generating a README for Your Project

A good README is essential for any project. Based on our conversations and the files you've shared, here's a comprehensive README draft for your "Devvconnect" project. You can copy and paste this into a README.md file at the root of your Devvconnect repository.

Markdown

# Devvconnect

Devvconnect is a full-stack platform designed to connect clients with skilled freelancers for various projects. Clients can post job opportunities, and freelancers can browse and apply for these jobs by submitting proposals.

## Features

* **User Authentication:** Secure user registration and login for clients and freelancers using Firebase Authentication.
* **Role-Based Access:** Distinct dashboards and functionalities for "Client" and "Freelancer" roles.
* **Client Features:**
    * Post new jobs with details like title, description, budget, tech stack, and timeline.
    * View and manage jobs they have posted.
    * Receive and review proposals from freelancers for their jobs.
    * Approve freelancer proposals.
* **Freelancer Features:**
    * Browse and search for available jobs.
    * Submit proposals for jobs.
    * View jobs they have been approved for.

## Technologies Used

### Backend
* **Framework:** FastAPI (Python)
* **ASGI Server:** Uvicorn
* **Database ORM:** SQLAlchemy
* **Database:** PostgreSQL (hosted on Render)
* **Authentication:** Firebase Admin SDK (for token verification)
* **Token Handling:** `python-jose[cryptography]`
* **Data Validation:** Pydantic (used by FastAPI)
* **Environment Variables:** `python-dotenv`
* **Dependencies:** See `devvconnect-backend/requirements.txt`

### Frontend
* **Framework/Library:** React (with Vite)
* **Authentication:** Firebase Client SDK
* **Routing:** React Router
* **Styling:** Tailwind CSS
* **API Calls:** Native `fetch` API (as seen in `src/api/api.js`)
* **Dependencies:** See `devvconnect-frontend/package.json`

## Project Structure (Simplified)

Devvconnect/
├── devvconnect-backend/       # FastAPI Python backend
│   ├── routes/                # API route handlers
│   ├── database.py            # Database setup (SQLAlchemy)
│   ├── firebase_auth.py       # Firebase Admin SDK setup & token verification
│   ├── main.py                # Main FastAPI application
│   ├── models.py              # SQLAlchemy ORM models
│   ├── schemas.py             # Pydantic schemas
│   └── requirements.txt       # Python dependencies
│   └── .env.example           # Example environment variables for backend
├── devvconnect-frontend/      # React Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js         # Centralized API call functions
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Firebase Auth context
│   │   ├── pages/             # React page components
│   │   ├── App.jsx
│   │   ├── main.jsx           # Main entry point for React app
│   │   └── firebaseConfig.js  # Firebase client SDK configuration
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│   └── .env.example           # Example environment variables for frontend
└── README.md                  # This file

## Prerequisites

* Node.js (e.g., LTS version like 18.x or 20.x)
* npm or yarn (for frontend package management)
* Python (e.g., 3.8 - 3.11, matching your Render deployment)
* pip (Python package installer)
* Git

## Local Development Setup

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd Devvconnect
    ```

2.  **Backend Setup (`devvconnect-backend`):**
    * Navigate to the backend directory:
        ```bash
        cd devvconnect-backend
        ```
    * Create and activate a Python virtual environment:
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows: venv\Scripts\activate
        ```
    * Install Python dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    * **Environment Variables:**
        * Create a `.env` file in the `devvconnect-backend` directory by copying from a `.env.example` (you should create this example file).
        * **`.env.example` for backend should look like:**
            ```env
            # For local PostgreSQL or Render PostgreSQL (if connecting directly)
            DATABASE_URL=postgresql://user:password@host:port/dbname 
            # Or for local SQLite (ensure database.py handles this fallback)
            # DATABASE_URL=sqlite:///./dev.db

            # Option 1: Path to your Firebase Admin SDK JSON key file
            # FIREBASE_CREDENTIALS=./path/to/your/firebase-service-account-key.json 
            # Option 2: Paste the JSON content directly (more secure for Render)
            FIREBASE_CREDENTIALS_JSON='{"type": "service_account", "project_id": "...", ...}'

            # URL of your locally running frontend for CORS
            CORS_ALLOWED_ORIGINS=http://localhost:5173,[http://127.0.0.1:5173](http://127.0.0.1:5173) 
            ```
        * Fill in your actual `DATABASE_URL` for your local database (or development Render DB).
        * Provide your Firebase Admin SDK credentials (either via `FIREBASE_CREDENTIALS` path or `FIREBASE_CREDENTIALS_JSON` content). **Ensure the actual service account key file is in your `.gitignore`!**
    * The `Base.metadata.create_all(bind=engine)` in `main.py` will attempt to create database tables when the application starts. For more complex migrations, consider Alembic.
    * Run the backend server:
        ```bash
        uvicorn main:app --reload --port 8000 
        ```
        (Assuming `main.py` is your FastAPI app file and `app` is your FastAPI instance).

3.  **Frontend Setup (`devvconnect-frontend`):**
    * Navigate to the frontend directory (from the repository root):
        ```bash
        cd devvconnect-frontend 
        ```
    * Install Node.js dependencies:
        ```bash
        npm install 
        # OR
        # yarn install
        ```
        (Use the command based on the `package-lock.json` or `yarn.lock` file in your frontend, or your preferred package manager).
    * **Environment Variables:**
        * Create a `.env` file in the `devvconnect-frontend` directory.
        * **`.env` file for local frontend development should contain:**
            ```env
            VITE_API_URL=http://localhost:8000 
            ```
            (This points to your locally running backend).
        * Ensure your `src/firebaseConfig.js` has your Firebase project's client-side configuration details.
    * Run the frontend development server:
        ```bash
        npm run dev 
        # OR
        # yarn dev
        ```
        (Check your `devvconnect-frontend/package.json` "scripts" section for the exact command). The frontend will typically be available at `http://localhost:5173`.

## Deployment

* **Backend (FastAPI):** Deployed on Render.
    * Uses `requirements.txt` for dependencies.
    * Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    * Environment variables (`DATABASE_URL`, `FIREBASE_CREDENTIALS_JSON`, `CORS_ALLOWED_ORIGINS` for `https://devvconnect.vercel.app`) must be set in the Render service dashboard.
* **Frontend (React/Vite):** Deployed on Vercel (`devvconnect.vercel.app`).
    * Uses Vite for building.
    * Environment variable `VITE_API_URL` must be set in Vercel project settings to `https://devvconnect.onrender.com` (your live backend URL).




// File: devvconnect-frontend/src/api/api.js
import { auth } from "../firebaseConfig"; // Assuming firebaseConfig.js is in the parent directory

export const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error(
    "VITE_API_URL is not set! Frontend API calls will likely fail. " +
    "For local development, create a .env file in the frontend root with VITE_API_URL=http://localhost:8000. " +
    "For Vercel, set this in project environment variables."
  );
}

// Helper to get Firebase token for current user
async function getToken() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error("getToken: No logged in user found by Firebase auth.currentUser.");
    throw new Error("No logged in user");
  }
  try {
    return await currentUser.getIdToken(true); // Force refresh token
  } catch (error) {
    console.error("getToken: Error getting ID token:", error);
    // If token refresh fails (e.g. user signed out, account deleted), sign out user locally
    // This depends on how you manage global auth state (e.g. React Context)
    // For now, just re-throw. Consider global sign-out logic here.
    throw new Error("Failed to get authentication token. User might need to sign in again.");
  }
}

// Save a user to backend (used for both client and freelancer signup)
export async function saveUserToBackend(userData) {
  const token = await getToken();

  const res = await fetch(`${API_BASE_URL}/users`, { // Endpoint for creating users
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData), // userData should include firebase_uid, name, email, role
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to save user to backend (non-JSON or network error)" }));
    console.error("Failed to save user to backend:", errorData);
    throw new Error(errorData.detail || "Failed to save user to backend");
  }
  return await res.json();
}

// Fetch logged-in user data from backend (typically /users/me)
export async function fetchCurrentUser() {
  const token = await getToken();

  const res = await fetch(`${API_BASE_URL}/users/me`, { 
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to fetch current user from backend (non-JSON or network error)" }));
    console.error("Failed to fetch current user from backend:", errorData);
    throw new Error(errorData.detail || "Failed to fetch current user from backend");
  }
  return await res.json();
}

// Fetch all jobs for Browse (freelancer)
export async function getJobs() {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/freelancer/jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to fetch jobs" }));
    console.error("Failed to fetch jobs:", errorData);
    throw new Error(errorData.detail || "Failed to fetch jobs");
  }
  return await res.json();
}

// Client: Post a new job
export async function postJob(jobData) {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/client/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to post job" }));
    console.error("Failed to post job:", errorData);
    throw new Error(errorData.detail || "Failed to post job");
  }
  return response.json();
}

// Client: get jobs posted by the current client
export async function getClientJobs() {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/client/jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to fetch client jobs" }));
    console.error("Failed to fetch client jobs:", errorData);
    throw new Error(errorData.detail || "Failed to fetch client jobs");
  }
  return await res.json();
}

// Client: approve a freelancer proposal
export async function approveProposal(proposalId) {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/client/proposals/${proposalId}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to approve proposal" }));
    console.error("Failed to approve proposal:", errorData);
    throw new Error(errorData.detail || "Failed to approve proposal");
  }
  return await res.json();
}

// Client: fetch their jobs with proposals
export async function fetchMyJobsWithProposals() {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/client/jobs-with-proposals`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to fetch client jobs with proposals" }));
    console.error("Failed to fetch client jobs with proposals:", errorData);
    throw new Error(errorData.detail || "Failed to fetch client jobs with proposals");
  }
  return await res.json();
}

// Freelancer: Submit a proposal for a job
export async function submitProposal(jobId, proposalData = {}) {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/freelancer/apply/${jobId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // body: JSON.stringify(proposalData), // Only if your backend endpoint expects a body
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to submit proposal" }));
    console.error("Failed to submit proposal:", errorData);
    throw new Error(errorData.detail || "Failed to submit proposal");
  }
  return await res.json();
}

// Freelancer: Get jobs they have been approved for
export async function getApprovedJobs() {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/freelancer/approved-jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to fetch approved jobs" }));
    console.error("Failed to fetch approved jobs:", errorData);
    throw new Error(errorData.detail || "Failed to fetch approved jobs");
  }
  return await res.json();
}
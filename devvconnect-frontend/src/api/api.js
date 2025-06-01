import { auth } from "../firebaseConfig"; // Assuming firebaseConfig.js is in the parent directory of api.js
// If firebaseConfig is elsewhere, adjust the path e.g., import { auth } from "./firebaseConfig";

const API_BASE_URL = "http://localhost:8000"; // Your API base URL

// Helper to get Firebase token for current user
async function getToken() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No logged in user");
  return await currentUser.getIdToken();
}

// Save a user to backend
export async function saveUserToBackend(user) {
  const token = await getToken();

  const res = await fetch(`${API_BASE_URL}/users`, { // Assuming /users is the correct endpoint from your users.py
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to save user to backend" }));
    console.error("Failed to save user to backend:", errorData);
    throw new Error(errorData.detail || "Failed to save user to backend");
  }
  return await res.json();
}

// Fetch logged-in user data from backend
export async function fetchCurrentUser() {
  const token = await getToken();

  const res = await fetch(`${API_BASE_URL}/users/me`, { // Assuming /users/me from your auth.py or users.py
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to fetch user from backend" }));
    console.error("Failed to fetch user from backend:", errorData);
    throw new Error(errorData.detail || "Failed to fetch user from backend");
  }
  return await res.json();
}

// Fetch all jobs for Browse (freelancer) - CORRECTED ENDPOINT
export async function getJobs() {
  const token = await getToken();

  // *** MODIFIED LINE: Changed from /jobs to /freelancer/jobs ***
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
  const response = await fetch(`${API_BASE_URL}/client/jobs`, { // Uses client-specific endpoint
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
export async function submitProposal(jobId, proposalData = {}) { // proposalData can be extended if needed
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/freelancer/apply/${jobId}`, { // Assuming /freelancer/apply/{job_id} from freelancer.py
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Ensure backend expects JSON if you send a body
      Authorization: `Bearer ${token}`,
    },
    // body: JSON.stringify(proposalData), // Add if your apply endpoint expects a body (e.g., cover letter)
                                         // The current freelancer.py apply_to_job doesn't expect a body, proposal is created with default values
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
  const res = await fetch(`${API_BASE_URL}/freelancer/approved-jobs`, { // Assuming /freelancer/approved-jobs from freelancer.py
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
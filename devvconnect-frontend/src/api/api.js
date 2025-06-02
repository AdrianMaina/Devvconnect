// File: devvconnect-frontend/src/api/api.js
import { auth } from "../firebaseConfig"; // Assuming firebaseConfig.js is in the parent directory

export const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error(
    "CRITICAL: VITE_API_URL is not set! Frontend API calls will likely fail. " +
    "For local development, create a .env file in the frontend root with VITE_API_URL=http://localhost:8000. " +
    "For Vercel, set this in project environment variables."
  );
} else {
  console.log(`API_BASE_URL is set to: ${API_BASE_URL}`);
}

// Helper to get Firebase token for current user
async function getToken() {
  console.log("getToken: Attempting to get ID token...");
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error("getToken: auth.currentUser is null or undefined at the start of getToken.");
    throw new Error("No logged in user (auth.currentUser is null)");
  }

  console.log(`getToken: currentUser found - Email: ${currentUser.email}, UID: ${currentUser.uid}`);

  try {
    console.log("getToken: Calling currentUser.getIdToken(true) to force refresh...");
    const token = await currentUser.getIdToken(true); // Force refresh token
    console.log(`getToken: Successfully retrieved ID token (first 20 chars): ${token ? token.substring(0, 20) + '...' : 'TOKEN IS NULL OR UNDEFINED'}`);
    if (!token) {
        console.error("getToken: getIdToken(true) returned a null or undefined token.");
        throw new Error("Failed to retrieve a valid token from Firebase.");
    }
    return token;
  } catch (error) {
    console.error("getToken: Error during getIdToken(true):", error);
    throw new Error(`Failed to get authentication token: ${error.message || "User might need to sign in again."}`);
  }
}

// Save a user to backend (used for both client and freelancer signup)
export async function saveUserToBackend(userData) {
  console.log("API CALL: saveUserToBackend called with userData:", userData);
  const fullUrl = `${API_BASE_URL}/users/`; // Ensure trailing slash if your backend POST /users expects it
  console.log(`Fetching URL (POST): ${fullUrl}`);
  console.log("Request body for saveUserToBackend:", userData);

  const token = await getToken(); // getToken will log its own steps

  const res = await fetch(fullUrl, { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  console.log(`Response status for saveUserToBackend: ${res.status}`);
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { detail: `Failed to save user to backend. Server responded with status ${res.status} and non-JSON body.` , status: res.status, statusText: res.statusText };
    }
    console.error(`API ERROR in saveUserToBackend: Status ${res.status}, Data: `, errorData);
    throw new Error(errorData.detail || `Failed to save user. Status: ${res.status}`);
  }
  
  const responseData = await res.json();
  console.log("API SUCCESS in saveUserToBackend: Response data: ", responseData);
  return responseData;
}

// Fetch logged-in user data from backend (typically /users/me)
export async function fetchCurrentUser() {
  console.log("API CALL: fetchCurrentUser called");
  const fullUrl = `${API_BASE_URL}/users/me`;
  console.log(`Fetching URL (GET): ${fullUrl}`);

  const token = await getToken();

  const res = await fetch(fullUrl, { 
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`Response status for fetchCurrentUser: ${res.status}`);
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { detail: `Failed to fetch current user. Server responded with status ${res.status} and non-JSON body.` , status: res.status, statusText: res.statusText };
    }
    console.error(`API ERROR in fetchCurrentUser: Status ${res.status}, Data: `, errorData);
    throw new Error(errorData.detail || `Failed to fetch current user. Status: ${res.status}`);
  }

  const responseData = await res.json();
  console.log("API SUCCESS in fetchCurrentUser: Response data: ", responseData);
  return responseData;
}

// Fetch all jobs for Browse (freelancer)
export async function getJobs() {
  console.log("API CALL: getJobs called");
  const fullUrl = `${API_BASE_URL}/freelancer/jobs`;
  console.log(`Fetching URL (GET): ${fullUrl}`);
  
  const token = await getToken();
  
  const res = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`Response status for getJobs: ${res.status}`);
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { detail: `Failed to fetch jobs. Server responded with status ${res.status} and non-JSON body.` , status: res.status, statusText: res.statusText };
    }
    console.error(`API ERROR in getJobs: Status ${res.status}, Data: `, errorData);
    throw new Error(errorData.detail || `Failed to fetch jobs. Status: ${res.status}`);
  }

  const responseData = await res.json();
  console.log("API SUCCESS in getJobs: Response data (first few items): ", responseData.slice ? responseData.slice(0,2) : responseData);
  return responseData;
}

// Client: Post a new job
export async function postJob(jobData) {
  console.log("API CALL: postJob called with jobData:", jobData);
  const fullUrl = `${API_BASE_URL}/client/jobs`;
  console.log(`Fetching URL (POST): ${fullUrl}`);
  console.log("Request body for postJob:", jobData);

  const token = await getToken();

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  });

  console.log(`Response status for postJob: ${response.status}`);
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { detail: `Failed to post job. Server responded with status ${response.status} and non-JSON body.` , status: response.status, statusText: response.statusText };
    }
    console.error(`API ERROR in postJob: Status ${response.status}, Data: `, errorData);
    throw new Error(errorData.detail || `Failed to post job. Status: ${response.status}`);
  }

  const responseData = await response.json();
  console.log("API SUCCESS in postJob: Response data: ", responseData);
  return responseData;
}

// Client: get jobs posted by the current client
export async function getClientJobs() {
  console.log("API CALL: getClientJobs called");
  const fullUrl = `${API_BASE_URL}/client/jobs`;
  console.log(`Fetching URL (GET): ${fullUrl}`);

  const token = await getToken();

  const res = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`Response status for getClientJobs: ${res.status}`);
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { detail: `Failed to fetch client jobs. Server responded with status ${res.status} and non-JSON body.` , status: res.status, statusText: res.statusText };
    }
    console.error(`API ERROR in getClientJobs: Status ${res.status}, Data: `, errorData);
    throw new Error(errorData.detail || `Failed to fetch client jobs. Status: ${res.status}`);
  }

  const responseData = await res.json();
  console.log("API SUCCESS in getClientJobs: Response data (first few items): ", responseData.slice ? responseData.slice(0,2) : responseData);
  return responseData;
}

// Client: approve a freelancer proposal
export async function approveProposal(proposalId) {
  console.log("API CALL: approveProposal called with proposalId:", proposalId);
  const fullUrl = `${API_BASE_URL}/client/proposals/${proposalId}/approve`;
  console.log(`Fetching URL (POST): ${fullUrl}`);
  
  const token = await getToken();

  const res = await fetch(fullUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`Response status for approveProposal: ${res.status}`);
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { detail: `Failed to approve proposal. Server responded with status ${res.status} and non-JSON body.` , status: res.status, statusText: res.statusText };
    }
    console.error(`API ERROR in approveProposal: Status ${res.status}, Data: `, errorData);
    throw new Error(errorData.detail || `Failed to approve proposal. Status: ${res.status}`);
  }

  const responseData = await res.json();
  console.log("API SUCCESS in approveProposal: Response data: ", responseData);
  return responseData;
}

// Client: fetch their jobs with proposals
export async function fetchMyJobsWithProposals() {
  console.log("API CALL: fetchMyJobsWithProposals called");
  const fullUrl = `${API_BASE_URL}/client/jobs-with-proposals`;
  console.log(`Fetching URL (GET): ${fullUrl}`);

  const token = await getToken();

  const res = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`Response status for fetchMyJobsWithProposals: ${res.status}`);
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { detail: `Failed to fetch client jobs with proposals. Server responded with status ${res.status} and non-JSON body.` , status: res.status, statusText: res.statusText };
    }
    console.error(`API ERROR in fetchMyJobsWithProposals: Status ${res.status}, Data: `, errorData);
    throw new Error(errorData.detail || `Failed to fetch client jobs with proposals. Status: ${res.status}`);
  }

  const responseData = await res.json();
  console.log("API SUCCESS in fetchMyJobsWithProposals: Response data (first few items): ", responseData.slice ? responseData.slice(0,2) : responseData);
  return responseData;
}

// Freelancer: Submit a proposal for a job
export async function submitProposal(jobId, proposalData = {}) {
  console.log("API CALL: submitProposal called with jobId:", jobId, "and proposalData:", proposalData);
  const fullUrl = `${API_BASE_URL}/freelancer/apply/${jobId}`;
  console.log(`Fetching URL (POST): ${fullUrl}`);
  console.log("Request body for submitProposal:", proposalData);

  const token = await getToken();

  const res = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: Object.keys(proposalData).length > 0 ? JSON.stringify(proposalData) : undefined, // Send body only if proposalData is not empty
  });

  console.log(`Response status for submitProposal: ${res.status}`);
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { detail: `Failed to submit proposal. Server responded with status ${res.status} and non-JSON body.` , status: res.status, statusText: res.statusText };
    }
    console.error(`API ERROR in submitProposal: Status ${res.status}, Data: `, errorData);
    throw new Error(errorData.detail || `Failed to submit proposal. Status: ${res.status}`);
  }

  const responseData = await res.json();
  console.log("API SUCCESS in submitProposal: Response data: ", responseData);
  return responseData;
}

// Freelancer: Get jobs they have been approved for
export async function getApprovedJobs() {
  console.log("API CALL: getApprovedJobs called");
  const fullUrl = `${API_BASE_URL}/freelancer/approved-jobs`;
  console.log(`Fetching URL (GET): ${fullUrl}`);

  const token = await getToken();

  const res = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`Response status for getApprovedJobs: ${res.status}`);
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { detail: `Failed to fetch approved jobs. Server responded with status ${res.status} and non-JSON body.` , status: res.status, statusText: res.statusText };
    }
    console.error(`API ERROR in getApprovedJobs: Status ${res.status}, Data: `, errorData);
    throw new Error(errorData.detail || `Failed to fetch approved jobs. Status: ${res.status}`);
  }
  
  const responseData = await res.json();
  console.log("API SUCCESS in getApprovedJobs: Response data (first few items): ", responseData.slice ? responseData.slice(0,2) : responseData);
  return responseData;
}
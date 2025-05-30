import { auth } from "../firebaseConfig";
import axios from "axios";

const BASE_URL = "http://localhost:8000";// Or your actual backend URL

// Helper to get Firebase token for current user
async function getToken() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No logged in user");
  return await currentUser.getIdToken();
}

// Save a user to backend
export async function saveUserToBackend(user) {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) throw new Error("Failed to save user to backend");
  return await res.json();
}

// Fetch logged-in user data from backend
export async function fetchCurrentUser() {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch user from backend");
  return await res.json();
}

// Fetch all jobs for browsing (freelancer)
export async function getJobs() {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch jobs");
  return await res.json();
}

// Fetch jobs approved for freelancer (job history)
export async function getApprovedJobs() {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/freelancer/approved-jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch approved jobs");
  return await res.json();
}

// Submit a proposal to apply for a job (freelancer)
export async function submitProposal(proposalData) {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(proposalData),
  });

  if (!res.ok) throw new Error("Failed to submit proposal");
  return await res.json();
}

// Client: post a new job
export async function postJob(jobData) {
  const token = await getToken(); // Use the consistent getToken() function
  const response = await fetch(`${BASE_URL}/jobs`, { // Changed from API_BASE_URL to BASE_URL
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to post job:", errorData);
    throw new Error(errorData.detail || "Failed to post job");
  }

  return response.json();
}

// Client: get jobs posted by the current client
export async function getClientJobs() {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/client/jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch client jobs");
  return await res.json();
}

// Client: approve a freelancer proposal
export async function approveProposal(proposalId) {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/client/proposals/${proposalId}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to approve proposal");
  return await res.json();
}

// Client: fetch their jobs with proposals
export async function fetchMyJobsWithProposals() {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/client/jobs-with-proposals`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch jobs with proposals");
  return await res.json();
}
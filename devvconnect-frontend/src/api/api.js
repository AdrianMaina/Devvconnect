// Assumes your FastAPI backend is running at http://localhost:8000

const BASE_URL = "http://localhost:8000";

export async function saveUserToBackend(user) {
  // user = { name, email, role }
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    throw new Error("Failed to save user to backend");
  }
  return await res.json();
}

export async function fetchCurrentUser(email) {
  // Your backend must support fetching user by email
  const res = await fetch(`${BASE_URL}/users?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user from backend");
  }
  const data = await res.json();
  if (data.length === 0) throw new Error("User not found");
  return data[0];
}
// File: devvconnect-frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"; // getIdToken is not directly needed here
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import BackButton from "../components/BackButton";
import { fetchCurrentUser } from "../api/api"; // Import the centralized API function

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      // Step 1: Sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // Step 2: Firebase auth state changes, auth.currentUser will be set.
      // getToken() inside fetchCurrentUser() will now work.
      // Fetch user details (including role) from your backend
      const backendUserData = await fetchCurrentUser();

      // Step 3: Redirect based on role from your backend
      if (backendUserData.role === "freelancer") {
        navigate("/freelancer-dashboard");
      } else if (backendUserData.role === "client") {
        navigate("/client-dashboard");
      } else {
        // Fallback or error if role is not what's expected
        console.error("Unknown user role from backend:", backendUserData.role);
        setError("Login successful, but could not determine user role for redirection.");
        // Potentially navigate to a generic dashboard or show an error
      }
    } catch (err) {
      console.error("Login error details:", err);
      // Provide more user-friendly messages for common Firebase auth errors
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes("Failed to fetch current user from backend")){
        setError("Login successful but failed to fetch user details from our server. Please try again shortly.");
      } else {
        setError(`Login failed: ${err.message || "An unexpected error occurred."}`);
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center p-4">
      {/* Background elements (unchanged) */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-purple-700/20 rounded-full filter blur-3xl animate-pulse-slowest"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-pink-700/20 rounded-full filter blur-3xl animate-pulse-slower-alt"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-md opacity-50"></div>
        <div className="relative bg-slate-900/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="flex justify-start mb-6">
            <BackButton />
          </div>
          <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {error && (
              <div className="my-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-center">
                <p className="text-red-300 text-sm flex items-center justify-center gap-2">
                  <span>⚠️</span>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full relative group bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl text-lg font-semibold shadow-xl hover:shadow-purple-600/25 transition-all duration-300 hover:scale-[1.02] transform"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2">
                ✨ Sign In
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/")} // Assuming '/' is your main signup options page or hero page
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
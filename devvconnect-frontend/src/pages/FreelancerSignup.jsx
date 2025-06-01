// File: devvconnect-frontend/src/pages/FreelancerSignup.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth"; // getIdToken is not directly needed here
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import BackButton from "../components/BackButton";
import { saveUserToBackend } from "../api/api"; // Import the centralized API function

export default function FreelancerSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDataToSave = {
        firebase_uid: user.uid,
        name,
        email,
        role: "freelancer", // Set role to freelancer
      };

      await saveUserToBackend(userDataToSave);

      navigate("/freelancer-dashboard");
    } catch (err) {
      console.error("Freelancer Signup error details:", err);
      setError(`Signup failed: ${err.message || "Please check your details and try again."}`);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-900 via-cyan-900 to-sky-900 flex items-center justify-center p-4">
      {/* Background elements (unchanged) */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
      <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-600/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-sky-600/30 rounded-full filter blur-3xl animate-pulse-slower"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-sky-600 rounded-2xl blur-md opacity-50"></div>
        <div className="relative bg-slate-900/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="flex justify-start mb-6">
            <BackButton />
          </div>
          <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400 mb-8">
            Freelancer Signup
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
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
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-center text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full relative group bg-gradient-to-r from-cyan-600 to-sky-600 text-white py-3 rounded-xl text-lg font-semibold shadow-xl hover:shadow-cyan-600/25 transition-all duration-300 hover:scale-[1.02] transform"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2">
                🚀 Create Freelancer Account
              </span>
            </button>
          </form>

          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-white font-semibold mb-3 text-center">Freelancer Benefits</h3>
            <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>Access to high-quality projects</span></div>
                <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>Showcase your portfolio</span></div>
                <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>Get paid securely</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
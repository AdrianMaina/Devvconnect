// src/pages/Hero.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center items-center text-white text-center px-6">
      <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Welcome to DevvConnect</h1>
      <p className="text-lg max-w-xl mb-10">
        DevvConnect is the ultimate platform connecting top tech freelancers with clients looking for innovative talent. Join now to post jobs, send proposals, and collaborate!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate("/freelancer-signup")}
          className="bg-white text-pink-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition text-lg shadow-md"
        >
          Sign Up as Freelancer
        </button>

        <button
          onClick={() => navigate("/client-signup")}
          className="bg-white text-indigo-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition text-lg shadow-md"
        >
          Sign Up as Client
        </button>

        <button
          onClick={() => navigate("/login")}
          className="bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition text-lg shadow-md"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}
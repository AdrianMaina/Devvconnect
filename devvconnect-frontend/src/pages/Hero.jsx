// src/pages/Hero.jsx
// src/pages/Hero.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-800">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-15 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-white text-center px-6">
        {/* Main heading with enhanced styling */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-pink-200 to-violet-200 bg-clip-text text-transparent drop-shadow-2xl">
            DevvConnect
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-pink-400 to-violet-400 mx-auto rounded-full"></div>
        </div>

        {/* Enhanced description */}
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-100 mb-4">
            The ultimate platform connecting top tech freelancers with clients looking for innovative talent.
          </p>
          <p className="text-lg text-gray-300 font-medium">
            ✨ Post jobs • Send proposals • Collaborate seamlessly ✨
          </p>
        </div>

        {/* Enhanced buttons with glassmorphism */}
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <button
            onClick={() => navigate("/freelancer-signup")}
            className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 transform"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <span className="relative flex items-center gap-2">
              🚀 Sign Up as Freelancer
            </span>
          </button>

          <button
            onClick={() => navigate("/client-signup")}
            className="group relative px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 hover:scale-105 transform"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <span className="relative flex items-center gap-2">
              💼 Sign Up as Client
            </span>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="group relative px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 transform shadow-xl"
          >
            <span className="flex items-center gap-2">
              🔑 Already have an account? Login
            </span>
          </button>
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          {[
            { icon: "⚡", title: "Lightning Fast", desc: "Quick job posting and proposal system" },
            { icon: "🛡️", title: "Secure & Trusted", desc: "Firebase authentication and secure payments" },
            { icon: "🌟", title: "Top Talent", desc: "Connect with skilled developers worldwide" }
          ].map((feature, index) => (
            <div key={index} className="group p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
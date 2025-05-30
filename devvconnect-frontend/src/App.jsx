import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ✅ Import the toaster

import Hero from "./pages/Hero";
import ClientSignup from "./pages/ClientSignup";
import FreelancerSignup from "./pages/FreelancerSignup";
import Login from "./pages/Login";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} /> {/* ✅ Add this */}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/client-signup" element={<ClientSignup />} />
        <Route path="/freelancer-signup" element={<FreelancerSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
      </Routes>
    </>
  );
}

export default App;




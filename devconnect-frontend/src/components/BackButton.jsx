import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium transition flex items-center"
    >
      ← Back to Home
    </button>
  );
}

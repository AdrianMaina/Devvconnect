import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css"; // Tailwind CSS

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>   {/* ✅ useNavigate will now work */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
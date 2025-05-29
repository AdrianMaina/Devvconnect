// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";

// Create the Auth context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase user object
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // "client" or "freelancer"
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const currentPath = location.pathname;

      if (firebaseUser) {
        setUser(firebaseUser);

        // Get role from localStorage (MVP-lite)
        const role = localStorage.getItem("userRole");
        setUserRole(role);
        setLoading(false);

        // Redirect to dashboard if on public route
        if (
          ["/", "/login", "/client-signup", "/freelancer-signup"].includes(currentPath)
        ) {
          if (role === "client") navigate("/client-dashboard");
          else if (role === "freelancer") navigate("/freelancer-dashboard");
        }
      } else {
        // User logged out
        setUser(null);
        setUserRole(null);
        setLoading(false);

        // Redirect to hero if trying to access protected routes
        if (
          !["/", "/login", "/client-signup", "/freelancer-signup"].includes(currentPath)
        ) {
          navigate("/");
        }
      }
    });

    return unsubscribe;
  }, [navigate, location]);

  // Logout function
  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("userRole");
    setUser(null);
    setUserRole(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, userRole, setUserRole, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}


import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

// Create the Auth context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // Firebase user object
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // "client" or "freelancer"
  const navigate = useNavigate();

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User logged in
        setUser(firebaseUser);
        // TODO: fetch role from backend here, or store in localStorage/sessionStorage or Firebase user claims
        // For MVP-lite, maybe store role in localStorage on signup/login
        const role = localStorage.getItem("userRole");
        setUserRole(role);
        setLoading(false);

    // Redirect to dashboard if currently on login/signup or hero
    if (
      window.location.pathname === "/" ||
      window.location.pathname === "/login" ||
      window.location.pathname === "/signup-client" ||
      window.location.pathname === "/signup-freelancer"
    ) {
      if (role === "client") navigate("/client-dashboard");
      else if (role === "freelancer") navigate("/freelancer-dashboard");
    }
  } else {
    // User logged out
    setUser(null);
    setUserRole(null);
    setLoading(false);
    if (
      ![
        "/",
        "/login",
        "/signup-client",
        "/signup-freelancer"
      ].includes(window.location.pathname)
    ) {
      navigate("/");
    }
  }
});
return unsubscribe;
  }, [navigate]);

  // Logout function
  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("userRole");
    setUser(null);
    setUserRole(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, userRole, setUserRole, loading, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context easily
export function useAuth() {
  return useContext(AuthContext);
}
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoutes = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/admins", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  if (error || !user || !allowedRoles.includes(user.role)) {
    // Not logged in or not allowed
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoutes;

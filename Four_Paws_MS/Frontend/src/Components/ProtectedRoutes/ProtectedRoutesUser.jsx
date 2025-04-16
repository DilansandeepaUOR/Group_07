import React, { useEffect, useState } from "react";
import axios from "axios";

const ProtectedRoutesUser = ({ children, allowedRolesUser }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/user", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
        console.log("role: ", );
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  if (error || !user || !allowedRolesUser.includes(user.role)) {
    // Not logged in or not allowed
    try {
        axios.get("http://localhost:3001/api/auth/logout", {
          withCredentials: true,
        });
        setUser(null);
        window.location.href = "/";
      } catch (err) {
        console.error("Logout failed:", err);
      }
  }

  return children;
};

export default ProtectedRoutesUser;

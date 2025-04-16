// components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
    const token = sessionStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/Login" replace />;
  }

  return children;
};

export default ProtectedRoutes;

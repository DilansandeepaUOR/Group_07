import React, { useEffect } from "react";
import axios from "axios";

const DeleteSuccessPage = () => {
  useEffect(() => {
    const handleLogout = async () => {
      try {
        await axios.get("http://localhost:3001/api/auth/logout", {
          withCredentials: true,
        });
        // Optionally clear localStorage or global user state here if used
      } catch (err) {
        console.error("Logout failed:", err);
      }
    };

    handleLogout(); // logout user automatically after deletion
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Account Deleted</h1>
        <p className="text-gray-300 mb-6">
          Your account has been successfully deleted. We're sorry to see you go.
        </p>
        <a
          href="/"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
};

export default DeleteSuccessPage;
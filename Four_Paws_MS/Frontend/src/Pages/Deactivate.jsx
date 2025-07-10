import React, { useEffect } from "react";
import axios from "axios";

const DeactivationSuccessPage = () => {
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

    handleLogout(); // logout user automatically after deactivation
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Account Deactivated</h1>
        <p className="text-gray-300 mb-6">
          Your account has been successfully deactivated. You can contact support to reactivate it.
        </p>
        <a
          href="/"
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
};

export default DeactivationSuccessPage;

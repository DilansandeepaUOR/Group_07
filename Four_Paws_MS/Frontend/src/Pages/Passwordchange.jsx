import React, { useEffect } from "react";
import axios from "axios";

const PassChangeSuccessPage = () => {

  //logout function
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Password Changed</h1>
        <p className="text-gray-300 mb-6">
          Your password has been successfully changed. You can check your password by logging out.
        </p>
        <div className="flex justify-center space-x-4">
            <a
          href="/"
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded"
        >
          Go to Home
        </a>

        <a
          href="/Login"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
          onClick={handleLogout}
        >
          Go to Login Page
        </a>
        </div>
      </div>
    </div>
  );
};

export default PassChangeSuccessPage;
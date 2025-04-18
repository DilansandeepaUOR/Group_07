import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import paw from "../../assets/paw_vector.png";
import "../../Styles/Fonts/Fonts.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Adlogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Clear session when login page loads
  useEffect(() => {
    const clearSession = async () => {
      try {
        await axios.get("http://localhost:3001/api/auth/logout", {
          withCredentials: true,
        });
        sessionStorage.clear();
        navigate("/Adlogin"); // Redirect to login page
      } catch (err) {
        console.error("Session cleanup failed:", err);
      }
    };

    clearSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/adloginform/adlogin",
        { email, password },
        { withCredentials: true }
      );

      const logedUser = await axios.get(
        "http://localhost:3001/api/auth/admins",
        { withCredentials: true }
      ); //response.data contains the logged user information
      const user = logedUser.data;

      if (user?.role === "Admin") {
        alert("Admin Login Successful!");
        window.location.href = "/Addashboard";
      } else if (user?.role === "Doctor") {
        alert("Doctor Login Successful!");
        window.location.href = "/docdashboard";
      } else if (user?.role === "Assistant Doctor") {
        alert("Assistant Doctor Login Successful!");
        window.location.href = "/assistdashboard";
      } else if (user?.role === "Pharmacist") {
        alert("Pharmacist Login Successful!");
        window.location.href = "/Pharmacy";
      } else if (user?.role === "Pet Shopper") {
        alert("Pet Shopper Login Successful!");
        window.location.href = "/psdashboard";
      } else {
        alert("Unauthorized role");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.error("Backend error response:", err.response.data);

        if (Array.isArray(err.response.data.error)) {
          // If the backend sends multiple validation errors as an array
          const errorMessages = err.response.data.error
            .map((err) => err.message)
            .join("\n");
          alert("Error:\n" + errorMessages);
        } else {
          // If it's a single error message
          alert("Error: " + err.response.data.error);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent bg-opacity-50 backdrop-blur-md z-50 ">
      <div className="bg-gradient-to-b from-[#69cac2] to-[#cbfffb] items-center p-8 rounded-lg shadow-lg w-96 relative border-2 border-gray-800">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-[#182020] mb-4 Poppins">
          Four Paws Administrative login
        </h2>
        <span>
          <img
            src={paw || "Admin"}
            alt="paw"
            className="absolute justify-center w-16 h-16 top-[-15px] left-[50%] translate-x-[-50%]"
          />
        </span>

        {/* Error Message */}
        {error && (
          <p className="text-red-700 bg-red-200 p-2 rounded text-center flex items-center gap-2">
            <FaExclamationCircle /> {error}
          </p>
        )}

        {/* Username Input */}
        <input
          type="text"
          placeholder="Your E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 border border-[#182020] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-[#182020]"
        />

        {/* Password Input with Toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pr-10 border border-[#182020] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-[#182020]"
          />
          <button
            className="absolute right-3 top-3 text-[#182020] hover:text-[#69cac2] cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-right mt-2 mb-4">
          <button
            className="text-sm text-[#182020] hover:underline underline-offset-4 cursor-pointer"
            onClick={() => alert("Forgot Password functionality coming soon!")}
          >
            Forgot Password?
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleLogin}
            className="px-4 py-2 rounded-lg transition flex items-center justify-center w-full gap-2 bg-[#028478] hover:bg-[#5ba29c] text-white cursor-pointer"
          >
            Login
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-[#46dfd0]"></div>
      </div>
    </div>
  );
}

export default Adlogin;

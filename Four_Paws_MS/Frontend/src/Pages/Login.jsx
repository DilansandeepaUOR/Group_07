import {
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaGoogle,
} from "react-icons/fa";
import paw from "../assets/paw_vector.png";
import "../Styles/Fonts/Fonts.css";
import axios from "axios";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

function Login() {
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
          withCredentials: true
        });
        sessionStorage.clear();
        navigate("/Login"); // Redirect to login page
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
      const response= await axios
        .post(
          "http://localhost:3001/api/loginform/login",
          { email, password },
          { withCredentials: true }
        )
        .then((response) => {
          alert(response.data.message);
          //alert("Login successful!");
          window.location.href = "/"; // Redirect to profile
        })
        .catch((error) => {
          alert("Login failed: " + error.response.data.error);
        });
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
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] z-50">
      <div className="absolute top-5 left-5 object-cover w-[200px]">
        <img src={logo} alt="logo" />
      </div>
      <div className="bg-gradient-to-b from-[#182020] to-[#394a46] items-center p-8 rounded-lg shadow-2xl w-96 relative border-2 border-gray-800">
        {/* Close Button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-3 right-3 text-white hover:text-gray-200 text-lg cursor-pointer"
        >
          <FaTimes size={22} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-4 Poppins">
          Log in to Your Faw Paws Account
        </h2>
        <span>
          <img
            src={paw}
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
          className="w-full p-3 mb-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-[#ffffff]"
        />

        {/* Password Input with Toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pr-10 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-[#ffffff]"
          />
          <button
            className="absolute right-3 top-3 text-[#ffffff] hover:text-[#69cac2] cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-right mt-2 mb-4">
          <button
            className="text-sm text-white hover:underline underline-offset-4 hover:text-[#69cac2] cursor-pointer"
            onClick={() => alert("Forgot Password functionality coming soon!")}
          >
            Forgot Password?
          </button>
        </div>

        {/* Buttons */}
        <div className="flex flex-col justify-center items-center gap-5">
          <div>
            <button
              onClick={handleLogin}
              className="px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 w-[300px] bg-[#028478] hover:bg-[#5ba29c] text-white font-bold cursor-pointer"
            >
              Login
            </button>
          </div>

          {/* Divider */}
          <div className="relative w-[300px]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full my-6 border-t border-[#46dfd0]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-[#394a46] text-white text-sm">OR</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-white justify-center flex items-center pb-3">
              New to Four Paws?{" "}
            </p>
            <Link to="/Register">
              <button className="px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 w-[300px] border-1 hover:bg-red-500 text-white font-bold cursor-pointer">
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

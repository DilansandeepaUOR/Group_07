import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import paw from "../assets/paw_vector.png";
import "../Styles/Fonts/Fonts.css";
import axios from "axios";


function Login({onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/api/loginform/login", {email,password});
      alert(res.data.message);
      localStorage.setItem("token", res.data.token);

      if(res.data.message === "Login successful") {
        onClose();
        navigate('/');
      }

      
      
      
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Backend error response:", error.response.data);
        
        if (Array.isArray(error.response.data.error)) {
          // If the backend sends multiple validation errors as an array
          const errorMessages = error.response.data.error.map(err => err.message).join("\n");
          alert("Error:\n" + errorMessages);
        } else {
          // If it's a single error message
          alert("Error: " + error.response.data.error);
        }
      } else {
        alert("Error: Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent bg-opacity-50 backdrop-blur-md z-50 ">
      <div className="bg-gradient-to-b from-[#182020] to-[#394a46] items-center p-8 rounded-lg shadow-lg w-96 relative border-2 border-gray-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-200 text-lg cursor-pointer"
        >
          <FaTimes size={22} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-4 Poppins">
          Log in to Your Faw Paws Account
        </h2>
        <span><img
                src={paw}
                alt="paw"
                className="absolute justify-center w-16 h-16 top-[-15px] left-[50%] translate-x-[-50%]"
              /></span>

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
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 transition cursor-pointer"
          >
            Cancel
          </button>

          <div>
          <button
            onClick={handleLogin}
            className='px-4 py-2 rounded-lg transition flex items-center gap-2 bg-[#028478] hover:bg-[#5ba29c] text-white cursor-pointer'
          >
            Login
          </button>
          </div>

        </div>

        {/* Divider */}
        <div className="my-6 border-t border-[#46dfd0]"></div>

        {/* Sign Up */}
        <div className="text-center">
          <p className="text-sm text-white">
            Don't have an account?{" "}
            <button
              className="text-red-500 font-bold hover:underline underline-offset-4 cursor-pointer"
              onClick={() => alert("Sign Up functionality coming soon!")}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;


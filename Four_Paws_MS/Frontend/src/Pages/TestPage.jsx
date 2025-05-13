import React, { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import paw from "../assets/paw_vector.png";
import "../Styles/Fonts/Fonts.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("login"); // login or register
  const navigate = useNavigate();

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    petName: "",
    petDob: null,
    petType: "dog",
    password: "",
    confirmPassword: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login functions
  const storeSession = (sessionData) => {
    sessionStorage.setItem("authToken", sessionData);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!email || !password) {
      setLoginError("Please fill in both fields.");
      return;
    }

    try {
      axios
        .post(
          "http://localhost:3001/api/loginform/login",
          { email, password },
          { withCredentials: true }
        )
        .then((response) => {
          storeSession(response.data.session);
          alert("Login successful!");
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

  // Register functions
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.address ||
      !formData.phone ||
      !formData.email ||
      !formData.petName ||
      !formData.petDob ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setRegisterError("All fields are required!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setRegisterError("Passwords do not match!");
      return;
    }

    // post data to backend
    try {
      const res = await axios.post(
        "http://localhost:3001/api/registerform/register",
        formData
      );
      alert(res.data.message);
      if (res.data.message === "pet and pet owner added successfully") {
        navigate("/");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Backend error response:", error.response.data);

        if (Array.isArray(error.response.data.error)) {
          // If the backend sends multiple validation errors as an array
          const errorMessages = error.response.data.error
            .map((err) => err.message)
            .join("\n");
          alert("Error:\n" + errorMessages);
        } else {
          // If it's a single error message
          alert("Error: " + error.response.data.error);
        }
      } else {
        alert("Error: Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1010] to-[#182020] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center relative">
          <img
            src={paw}
            alt="Four Paws Logo"
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-white Poppins">
            Four Paws Pet Care
          </h2>
          <p className="mt-2 text-sm text-[#46dfd0]">
            {activeTab === "login" 
              ? "Sign in to your account" 
              : "Create your new account"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#46dfd0] mb-6">
          <button
            className={`flex-1 py-3 font-medium text-base ${
              activeTab === "login"
                ? "text-[#46dfd0] border-b-2 border-[#46dfd0]"
                : "text-gray-300 hover:text-white"
            }`}
            onClick={() => setActiveTab("login")}
          >
            LOGIN
          </button>
          <button
            className={`flex-1 py-3 font-medium text-base ${
              activeTab === "register"
                ? "text-[#46dfd0] border-b-2 border-[#46dfd0]"
                : "text-gray-300 hover:text-white"
            }`}
            onClick={() => setActiveTab("register")}
          >
            REGISTER
          </button>
        </div>

        {/* Card for form content */}
        <div className="bg-gradient-to-b from-[#182020] to-[#394a46] p-8 rounded-lg shadow-lg border-2 border-gray-800">
          {/* Login Form */}
          {activeTab === "login" && (
            <div>
              {/* Error Message */}
              {loginError && (
                <p className="text-red-700 bg-red-200 p-2 mb-4 rounded text-center flex items-center gap-2">
                  <FaExclamationCircle /> {loginError}
                </p>
              )}

              <form onSubmit={handleLogin}>
                {/* Email Input */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Your E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-transparent"
                  />
                </div>

                {/* Password Input with Toggle */}
                <div className="mb-2 relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-10 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-transparent"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-white hover:text-[#69cac2] cursor-pointer"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>

                {/* Forgot Password */}
                <div className="text-right mb-6">
                  <button
                    type="button"
                    className="text-sm text-white hover:underline underline-offset-4 hover:text-[#69cac2] cursor-pointer"
                    onClick={() =>
                      alert("Forgot Password functionality coming soon!")
                    }
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg transition flex items-center justify-center gap-2 bg-[#028478] hover:bg-[#5ba29c] text-white cursor-pointer font-medium"
                >
                  Sign in
                </button>
              </form>

              {/* Switch to Register */}
              <div className="text-center mt-6">
                <p className="text-sm text-white">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-red-500 font-bold hover:underline underline-offset-4 cursor-pointer"
                    onClick={() => setActiveTab("register")}
                  >
                    Register now
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <div>
              {/* Error Message */}
              {registerError && (
                <p className="text-red-700 bg-red-200 p-2 mb-4 rounded text-center flex items-center gap-2">
                  <FaExclamationCircle /> {registerError}
                </p>
              )}

              <form onSubmit={handleRegister}>
                {/* Personal Details */}
                <h3 className="text-lg font-semibold text-white mb-3">
                  Personal Details
                </h3>
                <div className="space-y-3 mb-5">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
                  />
                </div>

                {/* Pet Details */}
                <h3 className="text-lg font-semibold text-white mb-3">
                  Pet Details
                </h3>
                <div className="space-y-3 mb-5">
                  <input
                    type="text"
                    name="petName"
                    placeholder="Pet Name"
                    value={formData.petName}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
                  />
                  <input
                    type="date"
                    name="petDob"
                    placeholder="Pet Date of Birth"
                    value={formData.petDob}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
                  />

                  {/* Pet Type Dropdown */}
                  <select
                    name="petType"
                    value={formData.petType}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
                  >
                    <option value="dog" className="text-black">
                      Dog
                    </option>
                    <option value="cat" className="text-black">
                      Cat
                    </option>
                    <option value="cow" className="text-black">
                      Cow
                    </option>
                    <option value="other" className="text-black">
                      Other
                    </option>
                  </select>
                </div>

                {/* Password Fields */}
                <h3 className="text-lg font-semibold text-white mb-3">
                  Create Password
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-3 pr-10 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-white hover:text-[#69cac2]"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-3 pr-10 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-white hover:text-[#69cac2]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#028478] text-white rounded-lg hover:bg-[#5ba29c] transition cursor-pointer font-medium"
                >
                  Create Account
                </button>
              </form>

              {/* Switch to Login */}
              <div className="text-center mt-6">
                <p className="text-sm text-white">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-red-500 font-bold hover:underline underline-offset-4 cursor-pointer"
                    onClick={() => setActiveTab("login")}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
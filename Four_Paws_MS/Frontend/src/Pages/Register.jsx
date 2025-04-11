import React, { useState } from "react";
import {
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
} from "react-icons/fa";
import paw from "../assets/paw_vector.png";
import "../Styles/Fonts/Fonts.css";
import "../Styles/Registerpage/Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

function Register() {
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

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

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
      setError("All fields are required!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
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
        onClose();
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
    <div className="fixed inset-0 flex flex-col items-center bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] z-50 overflow-y-auto py-10">
      <div className="flex top-5 left-5 object-cover w-[200px] mb-10">
        <img src={logo} alt="logo" />
      </div>

      <div className="bg-gradient-to-b from-[#182020] to-[#394a46] p-8 rounded-lg shadow-lg w-full max-w-4xl relative border-2 border-gray-800">
        {/* Close Button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-3 right-3 text-white hover:text-gray-200 text-lg cursor-pointer"
        >
          <FaTimes size={22} />
        </button>

        {/* Title */}
        <div className="text-center mb-8">
          <img
            src={paw}
            alt="paw"
            className="absolute justify-center w-16 h-16 top-[-15px] left-[50%] translate-x-[-50%]"
          />
          <h2 className="text-2xl font-bold text-white Poppins">
            Create Your Four Paws Account
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p className="flex items-center gap-2">
              <FaExclamationCircle /> {error}
            </p>
          </div>
        )}

        {/* Form Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Personal Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-[#46dfd0] pb-2">
              Personal Details
            </h3>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
            />
          </div>

          {/* Right Column - Pet Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-[#46dfd0] pb-2">
              Pet Details
            </h3>
            <input
              type="text"
              name="petName"
              placeholder="Pet Name"
              value={formData.petName}
              onChange={handleChange}
              className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Pet DOB
                </label>
                <input
                  type="date"
                  name="petDob"
                  value={formData.petDob}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Pet Type
                </label>
                <select
                  name="petType"
                  value={formData.petType}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
                >
                  <option value="dog" className="bg-[#182020]">
                    Dog
                  </option>
                  <option value="cat" className="bg-[#182020]">
                    Cat
                  </option>
                  <option value="cow" className="bg-[#182020]">
                    Cow
                  </option>
                  <option value="other" className="bg-[#182020]">
                    Other
                  </option>
                </select>
              </div>
            </div>
            {/* Add more pet fields here if needed */}
          </div>
        </div>

        {/* Middle Section - Password Fields (centered below both columns) */}
        <div className="max-w-md mx-auto space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-[#46dfd0] pb-2 text-center">
            Create Password
          </h3>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 pr-10 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
            />
            <button
              className="absolute right-3 top-3 text-white hover:text-[#69cac2]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 pr-10 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
            />
            <button
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

        {/* Buttons */}

        <div className="flex flex-col justify-center items-center gap-5 mt-6">
          <div>
            <button
              onClick={handleRegister}
              className="px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 w-[300px] bg-red-500 border-[1px] hover:bg-red-400 text-white font-bold cursor-pointer"
            >
              Register
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

          {/* Login button */}
          <div>
              <p className="text-sm text-white text-center justify-center items-center">
                Already have an account?{" "}
                <Link to="/Login">
              <button className="px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 w-[300px] border-1 hover:bg-[#5ba29c] text-white font-bold cursor-pointer">
                Login
              </button>
            </Link>
              </p>
            </div>

            
        </div>
      </div>
    </div>
  );
}

export default Register;

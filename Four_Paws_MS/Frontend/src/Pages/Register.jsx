import React, { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import paw from "../assets/paw_vector.png"; // Add your paw vector image here
import "../Styles/Fonts/Fonts.css"; // Add your CSS file here
import "../Styles/Registerpage/Register.css"; // Add your CSS file here

function Register({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    petName: "",
    petAge: "",
    petType: "dog",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    setError("");

    if (
      !formData.name ||
      !formData.address ||
      !formData.phone ||
      !formData.email ||
      !formData.petName ||
      !formData.petAge ||
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

    alert(`Welcome, ${formData.name}! Your account has been created.`);
    onClose(); // Close the modal after registration
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-md z-50 overlay">
      <div className="bg-gradient-to-b from-[#182020] to-[#394a46] p-8 rounded-lg shadow-lg w-96 relative border-2 border-gray-800 scrollable-modal">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-200 text-lg"
        >
          <FaTimes size={22} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-4 Poppins">
          Create Your Four Paws Account
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

        {/* Personal Details */}
        <h3 className="text-lg font-semibold text-white mb-2 mt-4">Personal Details</h3>
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full p-3 mb-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]" />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full p-3 mb-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]" />
        <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full p-3 mb-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]" />
        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full p-3 mb-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]" />

        {/* Pet Details */}
        <h3 className="text-lg font-semibold text-white mb-2 mt-4">Pet Details</h3>
        <input type="text" name="petName" placeholder="Pet Name" value={formData.petName} onChange={handleChange} className="w-full p-3 mb-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]" />
        <input type="text" name="petAge" placeholder="Pet Age" value={formData.petAge} onChange={handleChange} className="w-full p-3 mb-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]" />
        
        {/* Pet Type Dropdown */}
        <select name="petType" value={formData.petType} onChange={handleChange} className="w-full p-3 mb-3 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]">
          <option value="dog" className="text-black">Dog</option>
          <option value="cat" className="text-black">Cat</option>
          <option value="cow" className="text-black">Cow</option>
          <option value="other" className="text-black">Other</option>
        </select>

        {/* Password Fields */}
        <h3 className="text-lg font-semibold text-white mb-2 mt-4">Create Password</h3>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 pr-10 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
          />
          <button className="absolute right-3 top-3 text-white hover:text-[#69cac2]" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        <div className="relative mt-3">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 pr-10 border border-[#46dfd0] rounded-lg text-white bg-transparent focus:ring-2 focus:ring-[#028478]"
          />
          <button className="absolute right-3 top-3 text-white hover:text-[#69cac2]" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 transition cursor-pointer">Cancel</button>
          <button onClick={handleRegister} className="bg-[#028478] text-white px-4 py-2 rounded-lg hover:bg-[#5ba29c] transition cursor-pointer">Register</button>
        </div>

        {/* Already have an account? */}
        <div className="text-center mt-4">
          <p className="text-sm text-white">
            Already have an account?{" "}
            <button className="text-red-500 font-bold hover:underline underline-offset-4 cursor-pointer" onClick={onClose}>
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

import React, { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";

function Login({ isOpen, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null; // Don't render if not open

  const handleLogin = () => {
    setError("");
    if (!username || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Welcome, ${username}!`);
      onClose();
    }, 2000); // Simulated login delay
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent bg-opacity-50 backdrop-blur-md z-50">
      <div className="bg-gradient-to-b from-[#028478] via-[#46dfd0] to-[#70ded3] p-8 rounded-lg shadow-lg w-96 relative border-2 border-gray-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-200 text-lg"
        >
          <FaTimes size={22} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-4">
          Welcome Back!
        </h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-700 bg-red-200 p-2 rounded text-center flex items-center gap-2">
            <FaExclamationCircle /> {error}
          </p>
        )}

        {/* Username Input */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-[#22292F]"
        />

        {/* Password Input with Toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pr-10 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-[#22292F]"
          />
          <button
            className="absolute right-3 top-3 text-gray-700 hover:text-gray-900"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-right mt-2 mb-4">
          <button
            className="text-sm text-white hover:underline"
            onClick={() => alert("Forgot Password functionality coming soon!")}
          >
            Forgot Password?
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="bg-[#22292F] text-white px-4 py-2 rounded-lg hover:bg-[#343b41] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#028478] hover:bg-[#046b5f] text-white"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-[#46dfd0]"></div>

        {/* Sign Up */}
        <div className="text-center">
          <p className="text-sm text-white">
            Don't have an account?{" "}
            <button
              className="text-[#22292F] font-bold hover:underline"
              onClick={() => alert("Sign Up functionality coming soon!")}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;


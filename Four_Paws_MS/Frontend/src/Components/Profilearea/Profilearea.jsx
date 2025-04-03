import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profilearea() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch user data
  useEffect(() => {
    axios.get("http://localhost:3001/api/auth/user", { withCredentials: true })
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null); // No redirection, just set user to null
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", { withCredentials: true });
      alert("Logged out!");
      setUser(null); // Reset user state after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition duration-300"
      >
        {/* Profile Picture */}
        <img 
          src={user?.profilePic || "https://via.placeholder.com/50"} 
          alt="Profile" 
          className="w-10 h-10 rounded-full border border-gray-300"
        />
        {/* User Name */}
        <span className="text-sm font-medium">{user?.name}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
          <div className="px-4 py-3">
            <span className="block text-sm font-semibold text-gray-900">{user?.name}</span>
            <span className="block text-sm text-gray-500 truncate">{user?.email}</span>
          </div>
          <ul className="py-2">
            <Link to={'/profile'}><li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</li></Link>
            <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</li>
            <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><a href="/"  onClick={handleLogout}>Sign out</a></li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Profilearea;

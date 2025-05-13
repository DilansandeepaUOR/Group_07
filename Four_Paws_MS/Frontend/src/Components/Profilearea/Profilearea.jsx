import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import dp from "../../assets/paw_vector.png";

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
        className="flex items-center space-x-3 p-2 bg-gray-800 border-1 text-white rounded-full hover:bg-[#028478] hover:text-gray-900 transition duration-300 cursor-pointer"
      >
        {/* Profile Picture */}
        <img 
          src={user?.profilePic || dp} 
          alt="Profile" 
          className="w-10 h-10 rounded-full border border-[#028478] hover:border-gray-900"
        />
        {/* User Name */}
        <span className="text-sm font-medium">{user?.name}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#313940] border rounded-lg shadow-lg">
          <div className="px-4 py-3">
            <span className="block text-sm font-semibold text-gray-100">{user?.name}</span>
            <span className="block text-sm text-gray-100 truncate">{user?.email}</span>
          </div>
          <ul className="py-2">
            <Link to={'/profile'}><li className="block px-4 py-2 text-sm text-gray-100 hover:bg-[#69cac2]">Profile</li></Link>
            <li className="block px-4 py-2 text-sm text-gray-100 hover:bg-[#69cac2] cursor-pointer">Settings</li>
          <a href="/"><li className="block px-4 py-2 text-sm text-gray-100 hover:bg-[#69cac2] " onClick={handleLogout}>Sign out</li></a>  
          </ul>
        </div>
      )}
    </div>
  );
}

export default Profilearea;

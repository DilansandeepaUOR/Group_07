import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info
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

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", { withCredentials: true });
      alert("Logged out!");
      setUser(null); // Reset user state after logout
      <Link to={'/'}></Link>
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <ul>
          <li className="mb-2 text-gray-700 hover:text-blue-500 cursor-pointer">Edit Profile</li>
          <li className="mb-2 text-gray-700 hover:text-blue-500 cursor-pointer">Change Password</li>
          <li className="mb-2 text-gray-700 hover:text-blue-500 cursor-pointer">Privacy Settings</li>
          <li className="mb-2 text-gray-700 hover:text-red-500 cursor-pointer" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </aside>

      {/* Main Profile Section */}
      <main className="flex-1 p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">User Profile</h1>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : user ? (
            <>
              {/* User Info */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Personal Information</h2>
                <p className="text-gray-700"><strong>Name:</strong> {user.name}</p>
                <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
              </div>

              {/* Pet Info */}
              <div>
                <h2 className="text-lg font-semibold">Pet Information</h2>
                <div className="flex items-center gap-4 mt-4">
                  <img src={user.pet?.profilePic || "https://via.placeholder.com/150"} alt="Pet" className="w-24 h-24 rounded-full border" />
                  <div>
                    <p className="text-gray-700"><strong>Pet Name:</strong> {user.pet?.name || "N/A"}</p>
                    <p className="text-gray-700"><strong>Age:</strong> {user.pet?.age || "N/A"}</p>
                    <p className="text-gray-700"><strong>Type:</strong> {user.pet?.type || "N/A"}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">You are not logged in.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;

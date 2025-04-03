import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUserEdit,
  FaLock,
  FaShieldAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/user", { withCredentials: true })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  useEffect(() => {
    if (user?.id) {
      axios
        .get(`http://localhost:3001/api/profile/?id=${user.id}`)
        .then((response) => {
          setProfile(response.data);
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      alert("Logged out!");
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#46dfd0] text-white">
      <aside className="w-1/4 bg-[#028478] p-6 shadow-lg text-white">
        <button
          onClick={() => window.history.back()}
          className="flex items-center mb-4 text-gray-300 hover:text-white cursor-pointer"
        >
          <FaArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <ul>
          <li className="mb-2 hover:text-gray-300 flex items-center cursor-pointer">
            <FaUserEdit className="mr-2" /> Edit Profile
          </li>
          <li className="mb-2 hover:text-gray-300 flex items-center cursor-pointer">
            <FaLock className="mr-2" /> Change Password
          </li>
          <li className="mb-2 hover:text-gray-300 flex items-center cursor-pointer">
            <FaShieldAlt className="mr-2" /> Privacy Settings
          </li>
          <li className="hover:text-red-400">
            <a href="/" onClick={handleLogout} className="mb-2 flex items-center">
              <FaSignOutAlt className="mr-2" /> Logout
            </a>
          </li>
        </ul>
      </aside>

      <main className="flex-1 p-8 flex justify-center items-center">
        <div className="bg-[#22292F] p-6 rounded-lg shadow-lg max-w-2xl w-full text-white">
          <h1 className="text-3xl font-bold text-center mb-6">Profile Information</h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold">Your Information</h2>
            <p className="text-gray-300"><strong>Name:</strong> {profile?.Owner_name || "N/A"}</p>
            <p className="text-gray-300"><strong>Email:</strong> {profile?.E_mail || "N/A"}</p>
            <p className="text-gray-300"><strong>Phone Number:</strong> {profile?.Phone_number || "N/A"}</p>
            <p className="text-gray-300"><strong>Address:</strong> {profile?.Owner_address || "N/A"}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Pet Information</h2>
            {profile?.pet ? (
              <div className="flex items-center gap-4 mt-4">
                <img
                  src={profile.pet.profilePic}
                  alt="Pet"
                  className="w-24 h-24 rounded-full border border-gray-400"
                />
                <div>
                  <p className="text-gray-300"><strong>Pet Name:</strong> {profile.pet.name}</p>
                  <p className="text-gray-300"><strong>Age:</strong> {profile.pet.age}</p>
                  <p className="text-gray-300"><strong>Type:</strong> {profile.pet.type}</p>
                  <p className="text-gray-300"><strong>Medical Records:</strong></p>
                </div>
              </div>
            ) : (
              <p className="text-gray-300">No pet information available.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;

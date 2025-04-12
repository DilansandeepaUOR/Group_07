import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUserEdit,
  FaLock,
  FaSignOutAlt,
  FaUser,
  FaFileMedical,
} from "react-icons/fa";
import axios from "axios";
import dp from "../assets/paw_vector.png";

function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // <-- Track active tab

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
      {/* Sidebar */}
      <aside className="w-1/4 bg-gradient-to-b from-[#22292F] via-[#028478] to-[#46dfd0] p-6 shadow-lg text-white rounded-r-2xl">
        <button
          onClick={() => window.history.back()}
          className="flex items-center mb-6 text-gray-300 hover:text-white cursor-pointer"
        >
          <FaArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>
        <h2 className="text-2xl font-bold mb-6 border-b border-white/30 pb-2">
          Profile Settings
        </h2>
        <ul className="space-y-5">
          <li
            onClick={() => setActiveTab("profile")}
            className={`flex items-center cursor-pointer hover:text-gray-300 ${
              activeTab === "profile" ? "font-bold underline" : ""
            }`}
          >
            <FaUser className="mr-2" /> Your Profile
          </li>
          <li
            onClick={() => setActiveTab("edit")}
            className={`flex items-center cursor-pointer hover:text-gray-300 ${
              activeTab === "edit" ? "font-bold underline" : ""
            }`}
          >
            <FaUserEdit className="mr-2" /> Edit Your Profile
          </li>
          <li
            onClick={() => setActiveTab("password")}
            className={`flex items-center cursor-pointer hover:text-gray-300 ${
              activeTab === "password" ? "font-bold underline" : ""
            }`}
          >
            <FaLock className="mr-2" /> Change Password
          </li>
          <li
            onClick={() => setActiveTab("medical")}
            className={`flex items-center cursor-pointer hover:text-gray-300 ${
              activeTab === "medical" ? "font-bold underline" : ""
            }`}
          >
            <FaFileMedical className="mr-2" /> Medical Records
          </li>
          <li className="hover:text-red-400 flex items-center cursor-pointer">
            <a
              href="/"
              onClick={handleLogout}
              className="mb-2 flex items-center"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-gradient-to-b from-[#A6E3E9] via-[#028478] to-[#A6E3E9] flex justify-center items-center">
        <div className="bg-[#1f2937] p-8 rounded-2xl shadow-2xl max-w-4xl w-full text-white">

          {/* Header */}
          {activeTab === "profile" && (
            <>
              <div className="flex items-center gap-6 mb-8">
                <img
                  src={dp || "https://via.placeholder.com/150"}
                  alt="Pet"
                  className="w-28 h-28 rounded-full border-4 border-[#028478] object-cover"
                />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {profile?.Pet_name || "Pet Name"}
                  </h1>
                  <p className="text-sm text-gray-400">
                    Belongs to {profile?.Owner_name || "Owner"}
                  </p>
                </div>
              </div>

              {/* Owner Info */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-300">
                  Owner Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Name:</strong> {profile?.Owner_name || "N/A"}</p>
                  <p><strong>Email:</strong> {profile?.E_mail || "N/A"}</p>
                  <p><strong>Phone Number:</strong> {profile?.Phone_number || "N/A"}</p>
                  <p><strong>Address:</strong> {profile?.Owner_address || "N/A"}</p>
                </div>
              </div>

              {/* Pet Info */}
              <div>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-300">
                  Pet Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Type:</strong> {profile?.Pet_type || "N/A"}</p>
                  <p><strong>Date of Birth:</strong> {profile?.Pet_dob ? new Date(profile.Pet_dob).toLocaleDateString() : "N/A"}</p>
                  <p className="md:col-span-2">
                    <strong>Gender:</strong> {profile?.gender || "N/A"}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Edit Profile Tab */}
          {activeTab === "edit" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>
              <p>Coming soon... (You can add form fields here)</p>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === "password" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Change Password</h2>
              <p>Coming soon... (You can add a password change form here)</p>
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === "medical" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Medical Records</h2>
              <p>{profile?.medicals || "No medical records available"}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;

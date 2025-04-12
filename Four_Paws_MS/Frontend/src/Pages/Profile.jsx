import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUserEdit,
  FaLock,
  FaSignOutAlt,
  FaUser,
  FaFileMedical,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaCamera
} from "react-icons/fa";
import axios from "axios";
import dp from "../assets/paw_vector.png";

function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [editForm, setEditForm] = useState({
    Owner_name: "",
    E_mail: "",
    Phone_number: "",
    Owner_address: "",
    Pet_name: "",
    Pet_type: "",
    Pet_dob: "",
    gender: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [imagePreview, setImagePreview] = useState(dp);
  const [selectedImage, setSelectedImage] = useState(null);

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
          setEditForm({
            Owner_name: response.data.Owner_name || "",
            E_mail: response.data.E_mail || "",
            Phone_number: response.data.Phone_number || "",
            Owner_address: response.data.Owner_address || "",
            Pet_name: response.data.Pet_name || "",
            Pet_type: response.data.Pet_type || "",
            Pet_dob: response.data.Pet_dob ? 
              new Date(response.data.Pet_dob).toISOString().split('T')[0] : "",
            gender: response.data.gender || ""
          });
          if (response.data.profileImage) {
            setImagePreview(`http://localhost:3001/uploads/${response.data.profileImage}`);
          }
        })
        .catch(console.error);
    }
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }

      const response = await axios.put(
        `http://localhost:3001/api/profile/?id=${user.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      setProfile(response.data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/api/auth/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        { withCredentials: true }
      );
      alert("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      console.error("Error changing password:", err);
      alert(err.response?.data?.message || "Failed to change password");
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
            <button onClick={handleLogout} className="flex items-center">
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-gradient-to-b from-[#A6E3E9] via-[#028478] to-[#A6E3E9] flex justify-center items-center">
        <div className="bg-[#1f2937] p-8 rounded-2xl shadow-2xl max-w-4xl w-full text-white">

          {/* Profile View Tab */}
          {activeTab === "profile" && (
            <>
              <div className="flex items-center gap-6 mb-8">
                <img
                  src={imagePreview}
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
            <form onSubmit={handleProfileSubmit}>
              <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>
              
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <img
                      src={imagePreview}
                      alt="Pet"
                      className="w-32 h-32 rounded-full border-4 border-[#028478] object-cover"
                    />
                    <label className="absolute bottom-0 right-0 bg-[#028478] rounded-full p-2 cursor-pointer hover:bg-[#04695e]">
                      <FaCamera />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-400">Click to change photo</p>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Owner Name</label>
                    <input
                      type="text"
                      name="Owner_name"
                      value={editForm.Owner_name}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="E_mail"
                      value={editForm.E_mail}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="Phone_number"
                      value={editForm.Phone_number}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-300">
                  Pet Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Pet Name</label>
                    <input
                      type="text"
                      name="Pet_name"
                      value={editForm.Pet_name}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Pet Type</label>
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                    >
                      <option value="">Select</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Cow">Cow</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="Pet_dob"
                      value={editForm.Pet_dob}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Address</label>
                <textarea
                  name="Owner_address"
                  value={editForm.Owner_address}
                  onChange={handleEditChange}
                  className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600 h-24"
                />
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-[#028478] hover:bg-[#04695e] px-6 py-2 rounded-lg flex items-center font-medium"
                >
                  <FaSave className="mr-2" /> Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Change Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit}>
              <h2 className="text-2xl font-bold mb-6">Change Password</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-300 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600 pr-10"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600 pr-10"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#028478] hover:bg-[#04695e] px-6 py-2 rounded-lg flex items-center font-medium"
                >
                  <FaLock className="mr-2" /> Change Password
                </button>
              </div>
            </form>
          )}

          {/* Medical Records Tab */}
          {activeTab === "medical" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Medical Records</h2>
              <div className="bg-[#374151] p-4 rounded-lg">
                {profile?.medicals ? (
                  <p className="whitespace-pre-line">{profile.medicals}</p>
                ) : (
                  <p className="text-gray-400">No medical records available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;
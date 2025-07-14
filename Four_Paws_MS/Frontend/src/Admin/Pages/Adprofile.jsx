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
  FaCamera,
  FaTrash,
  FaBan,
} from "react-icons/fa";
import axios from "axios";
import dp from "../../assets/paw_vector.png";
import { useNavigate } from "react-router-dom";
import e from "cors";

function adprofile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    address: "",
    image: null,
    oldImage: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [imagePreview, setImagePreview] = useState(dp);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/admins", { withCredentials: true })
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
        .get(`http://localhost:3001/api/adprofile/?id=${user.id}`)
        .then((response) => {
          setProfile(response.data);
          setEditForm({
            first_name: response.data.first_name || "",
            last_name: response.data.last_name || "",
            email: response.data.email || "",
            phone_number: response.data.phone_number || "",
            address: response.data.address || "",
            gender: response.data.gender || "",
            date_of_birth: response.data.date_of_birth
              ? new Date(response.data.date_of_birth)
                  .toISOString()
                  .split("T")[0]
              : "",
            image: null,
            oldImage: response.data.Pro_pic || "", // Changed from profileImage to Pro_pic
          });

          if (response.data.Pro_pic) {
            // Changed from profileImage to Pro_pic
            setImagePreview(
              `http://localhost:3001${response.data.Pro_pic}` // Added proper path construction
            );
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
      window.location.href = "/adlogin";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setEditForm({ ...editForm, image: files[0] });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Update form state
      setEditForm((prev) => ({ ...prev, image: file }));

      // Update preview
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

      formData.append("first_name", editForm.first_name);
      formData.append("last_name", editForm.last_name);
      formData.append("email", editForm.email);
      formData.append("phone_number", editForm.phone_number);
      formData.append("gender", editForm.gender);
      formData.append("address", editForm.address);
      formData.append("date_of_birth", editForm.date_of_birth);

      // Include old image path if available
      if (editForm.oldImage) {
        formData.append("oldImage", editForm.oldImage);
      }

      // Append image with correct field name ('image' to match backend)
      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      const response = await axios.put(
        `http://localhost:3001/api/adupdate/?id=${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      // Handle successful update
      if (response.data.message) {
        alert(response.data.message);

        // Update image preview if a new image was uploaded
        if (response.data.profileImage) {
          setImagePreview(`http://localhost:3001${response.data.profileImage}`);
          setEditForm((prev) => ({
            ...prev,
            oldImage: response.data.profileImage,
            image: null,
          }));
        }
      }

      setProfile(response.data);
      alert(response.data.message || "Profile updated successfully!");
      navigate(0);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  //password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/api/adpasswordreset`,
        {
          id1: user.id,
          email: user.email,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { withCredentials: true }
      );

      alert(response.data.message || "Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to change password");
    }
  };

  //deactivate and delete account requests
  //Deactivate account request
  const handleDeactivateRequest = async () => {
    try {
      await axios.post(`http://localhost:3001/api/adaccount/deactivate`, {
        email: user.email,
        id: user.id,
      });
      if (user.id == 13) {
        alert("This admin account cannot be deactivated.");
      }
      else {
        alert("Confirmation email sent for deactivation.");
      }
    } catch (err) {
      alert("Failed to send confirmation email.");
    }
  };

  //Delete account request
  const handleDeleteRequest = async () => {
    try {
      await axios.post(`http://localhost:3001/api/adaccount/delete`, {
        email: user.email,
        id: user.id,
      });
      if (user.id == 13) {
        alert("This admin account cannot be deleted.");
      }
      else {
        alert("Confirmation email sent for deletion.");
      }
      
    } catch (err) {
      alert("Failed to send confirmation email.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#46dfd0] text-white">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gradient-to-b bg-[#71C9CE] p-6 shadow-lg text-gray-900 ">
        <button
          onClick={() => window.history.back()}
          className="flex items-center mb-6 text-gray-900 hover:text-white cursor-pointer"
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
            onClick={() => setActiveTab("deactivate")}
            className={`hover:text-yellow-400 flex items-center cursor-pointer ${
              activeTab === "deactivate"
                ? "font-bold underline text-yellow-400"
                : ""
            }`}
          >
            <FaBan className="mr-2" /> Deactivate Account
          </li>
          <li
            onClick={() => setActiveTab("delete")}
            className={`hover:text-red-400 flex items-center cursor-pointer ${
              activeTab === "delete" ? "font-bold underline text-red-400" : ""
            }`}
          >
            <FaTrash className="mr-2" /> Delete Account
          </li>

          <li className="hover:text-red-400 flex items-center cursor-pointer">
            <button onClick={handleLogout} className="flex items-center">
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] flex justify-center items-center">
        <div className="bg-[#71C9CE] p-8 rounded-2xl shadow-2xl max-w-4xl w-full text-gray-900">
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
                    Hi, {profile?.last_name || "Your name"}
                  </h1>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-300">
                  Your Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <strong>Name:</strong> {profile?.first_name || "N/A"}{" "}
                    {profile?.last_name || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile?.email || "N/A"}
                  </p>
                  <p>
                    <strong>Phone Number:</strong>{" "}
                    {profile?.phone_number || "N/A"}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong>{" "}
                    {profile?.date_of_birth
                      ? new Date(profile.date_of_birth).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="md:col-span-2">
                    <strong>Gender:</strong> {profile?.gender || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong> {profile?.address || "N/A"}
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
                  <p className="text-sm text-gray-700">Click to change photo</p>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Your First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={editForm.first_name}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Your Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={editForm.last_name}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={editForm.phone_number}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editForm.date_of_birth}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Pet Type</label>
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={editForm.address}
                      onChange={handleEditChange}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600 h-24"
                    />
                  </div>
                </div>
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
                  <label className="block text-gray-700 mb-1">
                    Current Password
                  </label>
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
                  <label className="block text-gray-700 mb-1">
                    New Password
                  </label>
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
                  <label className="block text-gray-700 mb-1">
                    Confirm New Password
                  </label>
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


          {/* Deactivate account Tab */}
          {activeTab === "deactivate" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Deactivate Your Account
              </h2>
              <div className="flex justify-center items-center bg-[#374151] p-4 rounded-lg">
                <button
                  className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded cursor-pointer"
                  onClick={handleDeactivateRequest}
                >
                  Request Deactivation via Email
                </button>
              </div>
            </div>
          )}

          {/* Delete account Tab */}
          {activeTab === "delete" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Delete Your Account</h2>
              <div className="flex items-center justify-center bg-[#374151] p-4 rounded-lg">
                <button
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded cursor-pointer"
                  onClick={handleDeleteRequest}
                >
                  Request Deletion via Email
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default adprofile;

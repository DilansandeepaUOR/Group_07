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
  FaPaw,
  FaTrash,
  FaBan,
} from "react-icons/fa";
import axios from "axios";
import dp from "../assets/paw_vector.png";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  //add pet form handling
  const [petForm, setPetForm] = useState({
    petName: "",
    petType: "Dog",
    petDob: null,
    petGender: "Male",
  });

  //edit owner profile form handling
  const [editForm, setEditForm] = useState({
    Owner_name: "",
    E_mail: "",
    Phone_number: "",
    Owner_address: "",
    image: null,
    oldImage: "",
  });

  //edit pet form handling
  const [editPetForm, setEditPetForm] = useState({
    Pet_name: "",
    Pet_type: "",
    Pet_dob: "",
    Pet_gender: "",
  });

  //password form handling
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

  //set image preview
  const [imagePreview, setImagePreview] = useState(dp);
  const navigate = useNavigate();

  //pet profile handling
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");

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

  //get data to edit owner profile
  useEffect(() => {
    if (user?.id) {
      axios
        .get(`http://localhost:3001/api/profile/?id=${user.id}`)
        .then((response) => {
          if (response.data) {
            setProfile(response.data);
            setEditForm({
              Owner_name: response.data.Owner_name || "",
              E_mail: response.data.E_mail || "",
              Phone_number: response.data.Phone_number || "",
              Owner_address: response.data.Owner_address || "",
              image: null,
              oldImage: response.data.Pro_pic || "", // Changed from profileImage to Pro_pic
            });

            if (response.data.Pro_pic) {
              // Changed from profileImage to Pro_pic
              setImagePreview(
                `http://localhost:3001${response.data.Pro_pic}` // Added proper path construction
              );
            }
            fetchPets();
          }
        })
        .catch((err) => {
          console.error("Error fetching profile:", err);
        });
    }
  }, [user?.id]);

  //get data to show and edit pet profile
  const fetchPets = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/pets/?id=${user.id}`
      );
      setPets(res.data || []); // Ensure pets is always an array
      if (res.data?.length > 0) {
        setSelectedPet(res.data[0].Pet_name);
      }
    } catch (err) {
      console.error("Error fetching pets:", err);
      setPets([]); // Fallback to empty array
    }
  };

  //logout function
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

  const handleEditOwnerChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setEditForm({ ...editForm, image: files[0] });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleEditPetChange = (e) => {
    const { name, value } = e.target;
    setEditPetForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlepetChange = (e) => {
    const { name, value } = e.target;
    setPetForm((prev) => ({ ...prev, [name]: value }));
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

      // Append all form fields
      formData.append("Owner_name", editForm.Owner_name);
      formData.append("E_mail", editForm.E_mail);
      formData.append("Phone_number", editForm.Phone_number);
      formData.append("Owner_address", editForm.Owner_address);

      // Include old image path if available
      if (editForm.oldImage) {
        formData.append("oldImage", editForm.oldImage);
      }

      // Append image with correct field name ('image' to match backend)
      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      const response = await axios.put(
        `http://localhost:3001/api/update/?id=${user.id}`,
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

        // Refresh profile data
        const profileRes = await axios.get(
          `http://localhost:3001/api/profile/?id=${user.id}`
        );
        setProfile(profileRes.data);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(err.response?.data?.error || "Failed to update profile");
    }
  };

  //pet profile update
  const handlePetProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:3001/api/updatepets/${user.id}/${editPetForm.Pet_id}`,
        editPetForm,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      alert(response.data.message || "Profile updated successfully!");
      navigate(0);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  //show pet profile information
  // Function to handle pet selection
  const handlePetSelection = (e) => {
    const selectedPetName = e.target.value;
    setSelectedPet(selectedPetName);

    const pet = pets.find((p) => p.Pet_name === selectedPetName);
    if (pet) {
      setEditPetForm({
        Pet_name: pet.Pet_name || "",
        Pet_type: pet.Pet_type || "",
        Pet_dob: pet.Pet_dob
          ? new Date(pet.Pet_dob).toISOString().split("T")[0]
          : "",
        Pet_gender: pet.Pet_gender || "",
        Pet_id: pet.Pet_id, // Make sure to include the pet ID
      });
    }
  };
  // Filter the selected pet based on the selectedPet state
  const selectedPetInfo = pets.find((pet) => pet.Pet_name === selectedPet);

  //pet account creation
  const handlePetSubmit = async (e) => {
    e.preventDefault();

    // Validate the addpet form
    if (!petForm.petName.trim()) {
      alert("Pet Name is required!");
      return;
    }
    if (!petForm.petDob) {
      alert("Pet Date of Birth is required!");
      return;
    }

    const petDobDate = new Date(petForm.petDob);
    const today = new Date();

    if (isNaN(petDobDate.getTime())) {
      alert("Invalid Date of Birth!");
      return;
    }

    if (petDobDate > today) {
      alert("Date of Birth cannot be a future date!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/api/addpet/?id=${user.id}`,
        petForm,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      alert(response.data.message || "Pet added successfully!");
      // Reset form after successful submission
      setPetForm({
        PetName: "",
        petType: "Dog",
        petDob: null,
        petGender: "Male",
      });
      navigate(0);
    } catch (err) {
      console.error("Error Inserting Pet", err);
      alert(err.response?.data?.message || "Failed to Inserting Pet");
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
        `http://localhost:3001/api/passwordreset`,
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
    await axios.post(`http://localhost:3001/api/account/deactivate`, {
      email: user.email,
      id: user.id,
    });
    alert("Confirmation email sent for deactivation.");
  } catch (err) {
    alert("Failed to send confirmation email.");
  }
};

//Delete account request
const handleDeleteRequest = async () => {
  try {
    await axios.post(`http://localhost:3001/api/account/delete`, {
      email: user.email,
      id: user.id,
    });
    alert("Confirmation email sent for deletion.");
  } catch (err) {
    alert("Failed to send confirmation email.");
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
          Profile
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
            onClick={() => setActiveTab("addpet")}
            className={`flex items-center cursor-pointer hover:text-gray-300 ${
              activeTab === "addpet" ? "font-bold underline" : ""
            }`}
          >
            <FaPaw className="mr-2" /> Add Your Pet
          </li>

          <li
            onClick={() => setActiveTab("medical")}
            className={`flex items-center cursor-pointer hover:text-gray-300 ${
              activeTab === "medical" ? "font-bold underline" : ""
            }`}
          >
            <FaFileMedical className="mr-2" /> Medical Records
          </li>

          <h2 className="text-2xl font-bold mb-6 mt-10 border-b border-white/30 pb-2">
            Profile Settings
          </h2>
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
                    {profile?.Owner_name || "Owner Name"}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {profile?.E_mail || "email"}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-300">
                  Your Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <strong>Name:</strong> {profile?.Owner_name || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile?.E_mail || "N/A"}
                  </p>
                  <p>
                    <strong>Phone Number:</strong>{" "}
                    {profile?.Phone_number || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong> {profile?.Owner_address || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-300">
                  Pet Information
                </h2>

                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <label className="font-bold">Select Your Pet Name</label>
                    <select
                      value={selectedPet}
                      onChange={handlePetSelection}
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                    >
                      {pets.map((pet) => (
                        <option key={pet.Pet_id} value={pet.Pet_name}>
                          {pet.Pet_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPetInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedPetInfo.Pet_name || "N/A"}
                      </p>
                      <p>
                        <strong>Type:</strong>{" "}
                        {selectedPetInfo.Pet_type || "N/A"}
                      </p>
                      <p>
                        <strong>Date of Birth:</strong>{" "}
                        {selectedPetInfo.Pet_dob
                          ? new Date(
                              selectedPetInfo.Pet_dob
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p className="md:col-span-2">
                        <strong>Gender:</strong>{" "}
                        {selectedPetInfo.Pet_gender || "N/A"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-white col-span-3 text-center">
                      No pet information available.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Edit Profile Tab */}
          {activeTab === "edit" && (
            <>
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
                          name="image" // Add name attribute
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-400">
                      Click to change photo
                    </p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-1">
                        Owner Name
                      </label>
                      <input
                        type="text"
                        name="Owner_name"
                        value={editForm.Owner_name}
                        onChange={handleEditOwnerChange}
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
                        onChange={handleEditOwnerChange}
                        className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="Phone_number"
                        value={editForm.Phone_number}
                        onChange={handleEditOwnerChange}
                        className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1">
                        Address
                      </label>
                      <textarea
                        name="Owner_address"
                        value={editForm.Owner_address}
                        onChange={handleEditOwnerChange}
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
              <form action="" onSubmit={handlePetProfileSubmit}>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-300">
                    Edit Pet Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <label className="font-bold">Select Your Pet Name</label>
                    <select
                      value={selectedPet}
                      onChange={handlePetSelection} // Use the new handler
                      className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                    >
                      {pets.map((pet) => (
                        <option key={pet.Pet_id} value={pet.Pet_name}>
                          {pet.Pet_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedPetInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-1">
                          Pet Name
                        </label>
                        <input
                          type="text"
                          name="Pet_name"
                          value={editPetForm.Pet_name}
                          onChange={handleEditPetChange}
                          className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1">
                          Pet Type
                        </label>
                        <select
                          name="Pet_type"
                          value={editPetForm.Pet_type}
                          onChange={handleEditPetChange}
                          className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                        >
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Cow">Cow</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="Pet_dob"
                          value={editPetForm.Pet_dob}
                          onChange={handleEditPetChange}
                          className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1">
                          Pet Type
                        </label>
                        <select
                          name="Pet_gender"
                          value={editPetForm.Pet_gender}
                          onChange={handleEditPetChange}
                          className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white col-span-3 text-center">
                      No pet information available.
                    </p>
                  )}
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
            </>
          )}

          {/* Add pets Tab */}
          {activeTab === "addpet" && (
            <div>
              <form action="" onSubmit={handlePetSubmit}>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-300">
                    Add Your Pets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-1">
                        Pet Name
                      </label>
                      <input
                        type="text"
                        name="petName"
                        value={petForm.petName}
                        onChange={handlepetChange}
                        className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1">
                        Pet Type
                      </label>
                      <select
                        name="petType"
                        value={petForm.petType}
                        onChange={handlepetChange}
                        className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Cow">Cow</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="petDob"
                        value={petForm.petDob}
                        onChange={handlepetChange}
                        className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1">
                        Pet Type
                      </label>
                      <select
                        name="petGender"
                        value={petForm.petGender}
                        onChange={handlepetChange}
                        className="w-full bg-[#374151] text-white p-2 rounded border border-gray-600"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    className="bg-[#028478] hover:bg-[#04695e] px-6 py-2 rounded-lg flex items-center font-medium"
                  >
                    <FaSave className="mr-2" /> Save Pet
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit}>
              <h2 className="text-2xl font-bold mb-6">Change Password</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-300 mb-1">
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
                  <label className="block text-gray-300 mb-1">
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
                  <label className="block text-gray-300 mb-1">
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

export default Profile;

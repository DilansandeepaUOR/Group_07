import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaPills,
  FaShoppingCart,
  FaPlus,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dp from "../../../src/assets/paw_vector.png"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [user, setUser] = useState(null);

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

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      alert("Logged out!");
      setUser(null);
      window.location.href = "/Adlogin";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] text-gray-900">
      <aside className="w-64 bg-[#71C9CE] text-gray-900 p-6 space-y-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>

        <div className="items-center gap-4 mt-4">
          <img
            src={dp || "Admin"} // Use optional chaining and default image
            alt="Admin"
            className="w-24 h-24 rounded-full border border-gray-400"
          />
          <div>
            <p className="text-black-300">
              <strong>Admin Name:</strong> {user?.fname} {user?.lname}
            </p>
            <p className="text-black-300">
              <strong>E mail:</strong> {user?.email}
            </p>
          </div>
        </div>
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setActiveTab("users")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700"
            >
              <FaUsers /> Manage Users
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("pharmacy")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700"
            >
              <FaPills /> Manage Pharmacy
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("petshop")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700"
            >
              <FaShoppingCart /> Manage Pet Shop
            </button>
          </li>

          <li className="hover:text-red-400 items-center gap-2 w-full text-left">
            <a href="/Adlogin" onClick={handleLogout} className="">
              <FaSignOutAlt className="mr-2" /> Logout
            </a>
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-8">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "pharmacy" && <PharmacyManagement />}
        {activeTab === "petshop" && <PetShopManagement />}
      </main>
    </div>
  );
};

const UserManagement = () => {
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-[#028478]">
        User Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md flex items-center gap-4">
          <FaUser className="text-[#028478] text-2xl" />
          <p className="text-lg font-medium text-gray-900">Add a New User</p>
          <Button
            className="ml-auto bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 flex items-center"
            onClick={() => setShowForm(true)}
          >
            <FaPlus className="mr-2" /> Add User
          </Button>
        </div>
      </div>
      {showForm && (
        <EmployeeRegistrationForm closeForm={() => setShowForm(false)} />
      )}
    </div>
  );
};

const EmployeeRegistrationForm = ({ closeForm }) => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    role: "Admin",
    address: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // post data to backend
    try {
      const res = await axios.post(
        "http://localhost:3001/api/adregform/empregister",
        formData
      );
      alert(res.data.message);
      if (res.data.message === "employee added successfully") {
        navigate("/Addashboard");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Backend error response:", error.response.data);

        if (Array.isArray(error.response.data.error)) {
          // If the backend sends multiple validation errors as an array
          const errorMessages = error.response.data.error
            .map((err) => err.message)
            .join("\n");
          alert("Error:\n" + errorMessages);
        } else {
          // If it's a single error message
          alert("Error: " + error.response.data.error);
        }
      } else {
        alert("Error: Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-semibold mb-4 text-[#028478]">
        Register New Employee
      </h2>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="fname"
          placeholder="First Name"
          className="p-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lname"
          placeholder="Last Name"
          className="p-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="p-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          className="p-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dob"
          className="p-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <select
          name="gender"
          className="p-2 border rounded-md"
          onChange={handleChange}
          required
        >
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <select
          name="role"
          className="p-2 border rounded-md"
          onChange={handleChange}
          required
        >
          <option>Admin</option>
          <option>Doctor</option>
          <option>Assistant Doctor</option>
          <option>Pharmacist</option>
          <option>Pet Shopper</option>
        </select>
        <input
          type="text"
          name="address"
          placeholder="Address"
          className="p-2 border rounded-md col-span-2"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="p-2 border rounded-md col-span-2"
          onChange={handleChange}
          required
        />
        <Button
          type="submit"
          className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 col-span-2"
        >
          Register
        </Button>
      </form>
      <button onClick={closeForm} className="mt-4 text-red-500 hover:underline">
        Cancel
      </button>
    </div>
  );
};

const PharmacyManagement = () => (
  <div>
    <h2 className="text-2xl font-semibold text-[#028478]">
      Pharmacy Management
    </h2>
    <p className="text-gray-700">Manage medicines and stock.</p>
  </div>
);

const PetShopManagement = () => (
  <div>
    <h2 className="text-2xl font-semibold text-[#028478]">
      Pet Shop Management
    </h2>
    <p className="text-gray-700">Manage pet shop inventory and sales.</p>
  </div>
);

export default AdminDashboard;

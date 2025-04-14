import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaPills,
  FaShoppingCart,
  FaPlus,
  FaUser,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dp from "../../../src/assets/paw_vector.png";

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

        <div className="flex justify-center items-center w-full">
          <div className="flex flex-col items-center border-1 p-4 bg-gray-50 gap-4 mt-4">
            <img
              src={dp || "Admin"}
              alt="Admin"
              className="w-24 h-24 rounded-full border border-gray-400"
            />
            <div>
              <p className="text-black-300">
                <strong>Admin: </strong> {user?.fname} {user?.lname}
              </p>
              <div>
                <button
                  onClick={() => setActiveTab("profsetting")}
                  className="flex items-center gap-2 w-full text-left hover:text-[#71C9CE] cursor-pointer"
                >
                  <FaUsers /> Profile Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        <ul className="space-y-5">
          <li className="">
            <button
              onClick={() => setActiveTab("users")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-50 cursor-pointer"
            >
              <FaUsers /> Manage Users
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("pharmacy")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-50 cursor-pointer"
            >
              <FaPills /> Manage Pharmacy
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("petshop")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-50 cursor-pointer"
            >
              <FaShoppingCart /> Manage Pet Shop
            </button>
          </li>
          <li className="flex hover:text-red-400 items-center gap-2 w-full text-left">
            <a href="/Adlogin" onClick={handleLogout}>
              <FaSignOutAlt className="mr-2" /> Logout
            </a>
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-8">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "pharmacy" && <PharmacyManagement />}
        {activeTab === "petshop" && <PetShopManagement />}
        {activeTab === "profsetting" && <ProfSetting />}
      </main>
    </div>
  );
};

//user management section
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    const res = await axios.get(
      "http://localhost:3001/api/adregform/employees"
    );
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (employee_id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await axios.delete(
        `http://localhost:3001/api/adregform/empdelete/${employee_id}`
      );
      fetchUsers();
    }
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-4 text-[#028478]">
        User Management
      </h2>
      <div className="flex justify-end mb-4">
        <Button
          className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 flex items-center"
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
        >
          <FaPlus className="mr-2" /> Add User
        </Button>
      </div>
      <div className="">
        <div className="overflow-y-auto max-h-[400px]">
          <table className="w-full text-left bg-gray-50 shadow-md rounded">
            <thead className="bg-[#71C9CE] text-gray-900 sticky top-0 z-10">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.employee_id} className="border-t">
                  <td className="p-3">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingUser(u);
                        setShowForm(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(u.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-20 p-4 rounded-md">
          {showForm && (
            <EmployeeRegistrationForm
              closeForm={() => setShowForm(false)}
              editingUser={editingUser}
              refreshUsers={fetchUsers}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const EmployeeRegistrationForm = ({ closeForm, editingUser, refreshUsers }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    gender: "Male",
    role: "Admin",
    address: "",
    password: "",
  });

  useEffect(() => {
    if (editingUser) setFormData(editingUser);
  }, [editingUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(
          `http://localhost:3001/api/adregform/empupdate?employee_id=${editingUser.employee_id}`,
          formData
        );
        alert("profile updated!");
      } else {
        await axios.post(
          "http://localhost:3001/api/adregform/empregister",
          formData
        );
      }
      refreshUsers();
      closeForm();
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
        {editingUser ? "Edit" : "Register New"} Employee
      </h2>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.first_name}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.last_name}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.email}
          required
        />
        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.phone_number}
          required
        />
        <input
          type="date"
          name="date_of_birth"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={
            formData.date_of_birth
              ? new Date(formData.date_of_birth).toISOString().split("T")[0]
              : ""
          }
          required
        />
        <select
          name="gender"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.gender}
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
          value={formData.role}
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
          value={formData.address}
          required
        />
        {!editingUser && (
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="p-2 border rounded-md col-span-2"
            onChange={handleChange}
            value={formData.password}
            required
          />
        )}
        <Button
          type="submit"
          className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 col-span-2"
        >
          {editingUser ? "Update" : "Register"}
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

const ProfSetting = () => (
  <div>
    <h2 className="text-2xl font-semibold text-[#028478]">Profile Setting</h2>
    <p className="text-gray-700">Profile Setting tab is active.</p>
  </div>
);

export default AdminDashboard;

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

const adPetShopManagement = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("products");

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
    try {
      if (window.confirm("Are you sure you want to delete this user?")) {
        const response = await axios.delete(
          `http://localhost:3001/api/adregform/empdelete?employee_id=${employee_id}`
        );
        alert(response.data.message);
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.error || "An error occurred while deleting.");
    }
  };

return (
    <div className="relative">
        <h2 className="text-2xl font-semibold mb-4 text-[#028478]">
            Pet Shop Management
        </h2>
        <div className="flex h-20 my-10 justify-center items-center bg-[#71C9CE]">
            <ul className="flex gap-30">
                <li className="">
                    <button
                        onClick={() => setActiveTab("products")}
                        className="flex items-center gap-2 w-full text-left border-1 p-2 rounded-2xl hover:border-gray-900 hover:text-gray-50 cursor-pointer"
                    >
                        <FaShoppingCart /> Manage Products
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setActiveTab("categories")}
                        className="flex items-center gap-2 w-full text-left border-1 p-2 rounded-2xl hover:border-gray-900 hover:text-gray-50 cursor-pointer"
                    >
                        <FaPills /> Manage Categories
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setActiveTab("suppliers")}
                        className="flex items-center gap-2 w-full text-left border-1 p-2 rounded-2xl hover:border-gray-900 hover:text-gray-50 cursor-pointer"
                    >
                        <FaUsers /> Manage Suppliers
                    </button>
                </li>
            </ul>
        </div>
        <div className="">
            {activeTab === "products" && <ProductManagement />}
            {activeTab === "categories" && <CategoryManagement />}
            {activeTab === "suppliers" && <SupplierManagement />}
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
    status: "Active",
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
        {editingUser && (
          <select
            name="status"
            className="p-2 border rounded-md"
            onChange={handleChange}
            value={formData.status}
            required
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        )}
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

const CategoryManagement = () => (
  <div>
    <p>categories</p>
  </div>
);

const ProductManagement = () => {

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
    try {
      if (window.confirm("Are you sure you want to delete this user?")) {
        const response = await axios.delete(
          `http://localhost:3001/api/adregform/empdelete?employee_id=${employee_id}`
        );
        alert(response.data.message);
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.error || "An error occurred while deleting.");
    }
  };
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          className="bg-[#71C9CE] hover:bg-gray-50 text-gray-900 flex items-center"
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
          <table className="w-full text-left bg-gray-50 shadow-md">
            <thead className="bg-[#71C9CE] text-gray-900 sticky top-0 z-10">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
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
                  <td className="p-3">{u.status}</td>
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
                      onClick={() => deleteUser(u.employee_id)}
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

const SupplierManagement = () => (
  <div>
    <p>Suppliers</p>
  </div>
);

export default adPetShopManagement;

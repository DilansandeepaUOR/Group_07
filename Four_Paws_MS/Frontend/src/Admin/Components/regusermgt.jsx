import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCamera } from "react-icons/fa";
import paw from "../../assets/paw_vector.png";

const RegUserMGT = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    const res = await axios.get(
      "http://localhost:3001/api/adreguserform/regusers"
    );
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered user list based on search term
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.E_mail.toLowerCase().includes(
      searchTerm.toLowerCase()
    );

    return matchesSearch;
  });

  const deleteUser = async (Owner_id) => {
    try {
      if (window.confirm("Are you sure you want to delete this user?")) {
        const response = await axios.delete(
          `http://localhost:3001/api/adreguserform/userdelete?Owner_id=${Owner_id}`
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
          <FaPlus className="mr-2" /> Add New Regular User
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 mt-5 mb-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search E mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full  md:w-1/2 px-4 py-2 rounded-md border border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#028478]"
          />
        </div>
      </div>

      <div className="">
        <div className="overflow-y-auto max-h-[400px]">
          <table className="w-full text-left bg-gray-50 shadow-md">
            <thead className="bg-[#71C9CE] text-gray-900 sticky top-0 z-10">
              <tr>
                <th className="p-3 border-l-2">Owner Name</th>
                <th className="p-3 border-l-2">Owner E-mail</th>
                <th className="p-3 border-l-2">Address</th>
                <th className="p-3 border-l-2">Phone</th>
                <th className="p-3 border-l-2">Pet Name</th>
                <th className="p-3 border-l-2">Status</th>
                <th className="p-3 border-l-2">Actioins</th>
              </tr>
            </thead>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tbody>
                  <tr key={u.Owner_id} className="border-t">
                    <td className="p-3 ">{u.Owner_name}</td>
                    <td className="p-3">{u.E_mail}</td>
                    <td className="p-3">{u.Owner_address}</td>
                    <td className="p-3">{u.Phone_number}</td>
                    <td className="p-3">{u.Pet_name}</td>

                    <td
                      className={`p-3 ${
                        u.Account_status != "Inactive"
                          ? "text-[#71C9CE] font-bold"
                          : "font-bold text-red-500"
                      }`}
                    >
                      {u.Account_status}
                    </td>

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
                        onClick={() => deleteUser(u.Owner_id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              ))
            ) : (
              <tbody>
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-4">
                    No Users found.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-20 p-4 rounded-md">
          {showForm && (
            <UserForm
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

const UserForm = ({ closeForm, editingUser, refreshUsers }) => {
  const [formData, setFormData] = useState({
    Owner_name: "",
    E_mail: "",
    Owner_address: "",
    Phone_number: "",
    Pet_name: "",
    Pet_type: "Dog",
    Pet_gender: "Male",
    Pet_dob: "",
    Account_status: "Active",
    confirmPassword: "",
    image: null,
    oldImage: "",
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        ...editingUser,
        image: null, // clear input
        oldImage: editingUser.Pro_pic || "", // set old image path
      });
    }
  }, [editingUser]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();

    // Append all form fields
    // Always send this
    submitData.append("Owner_id", editingUser?.Owner_id);

    // Append non-file fields explicitly
    submitData.append("Owner_name", formData.Owner_name);
    submitData.append("E_mail", formData.E_mail);
    submitData.append("Owner_address", formData.Owner_address);
    submitData.append("Phone_number", formData.Phone_number);
    submitData.append("Pet_name", formData.Pet_name);
    submitData.append("Pet_type", formData.Pet_type);
    submitData.append("Pet_dob", formData.Pet_dob);
    submitData.append("Pet_gender", formData.Pet_gender);
    submitData.append("Account_status", formData.Account_status);
    submitData.append("confirmPassword", formData.confirmPassword);

    // Handle image logic
    if (formData.image instanceof File) {
      submitData.append("image", formData.image);
    } else if (formData.oldImage) {
      submitData.append("oldImage", formData.oldImage);
    }

    try {
      if (editingUser) {
        await axios.put(
          `http://localhost:3001/api/adreguserform/reguserupdate?Owner_id=${editingUser.Owner_id}`,
          submitData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("User updated!");
      } else {
        await axios.post(
          "http://localhost:3001/api/adreguserform/reguserregister",
          submitData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("User added");
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
    <div className="bg-white/30 backdrop-blur-md p-20">
      <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
        <h2 className="text-xl font-semibold mb-4 text-[#028478]">
          {editingUser ? "Edit" : "Register New"} User
        </h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <div className="">
            {editingUser && (
              <label className="flex font-bold" htmlFor="name">
                Owner Name
              </label>
            )}
            <input
              type="text"
              name="Owner_name"
              placeholder="Owner Name"
              className="flex p-2 border rounded-md"
              onChange={handleChange}
              value={formData.Owner_name}
              required
            />
          </div>

          <div>
            {editingUser && (
              <label className="flex font-bold" htmlFor="Category id">
                Owner E-mail
              </label>
            )}
            <input
              type="text"
              name="E_mail"
              placeholder="Owner E_mail"
              className="p-2 border rounded-md"
              onChange={handleChange}
              value={formData.E_mail}
              required
            />
          </div>

          <div>
            {editingUser && (
              <label className="flex font-bold" htmlFor="Brand Name">
                Owner Address
              </label>
            )}
            <input
              type="text"
              name="Owner_address"
              placeholder="Owner Address"
              className="p-2 border rounded-md"
              onChange={handleChange}
              value={formData.Owner_address}
              required
            />
          </div>

          <div>
            {editingUser && (
              <label className="flex font-bold" htmlFor="Unit Price">
                Phone Number
              </label>
            )}
            <input
              type="text"
              name="Phone_number"
              placeholder="Phone Number"
              className="p-2 border rounded-md"
              onChange={handleChange}
              value={formData.Phone_number}
              required
            />
          </div>

          <div>
            {editingUser && (
              <label className="flex font-bold" htmlFor="Unit Price">
                Pet Name
              </label>
            )}
            <input
              type="text"
              name="Pet_name"
              placeholder="Pet Name"
              className="p-2 border rounded-md"
              onChange={handleChange}
              value={formData.Pet_name}
              required
            />
          </div>

          <div>
            {editingUser && (
              <label className="flex font-bold" htmlFor="status">
                Pet Type
              </label>
            )}
            <select
              name="Pet_type"
              className="p-2 border rounded-md"
              onChange={handleChange}
              value={formData.Pet_type}
              required
            >
              <option>Dog</option>
              <option>Cat</option>
              <option>Cow</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            {editingUser && (
              <label className="flex font-bold" htmlFor="Product Description">
                Pet DOB
              </label>
            )}
            <input
              type="date"
              name="Pet_dob"
              className="p-2 border rounded-md"
              onChange={handleChange}
              value={
                formData.Pet_dob
                  ? new Date(formData.Pet_dob).toISOString().split("T")[0]
                  : ""
              }
              required
            />
          </div>

          <div>
            {editingUser && (
              <label className="flex font-bold" htmlFor="status">
                Pet Gender
              </label>
            )}
            <select
              name="Pet_gender"
              className="p-2 border rounded-md"
              onChange={handleChange}
              value={formData.Pet_gender}
              required
            >
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          {editingUser && (
            <div>
              {editingUser && (
                <label className="flex font-bold" htmlFor="status">
                  Account Status
                </label>
              )}
              <select
                name="Account_status"
                className="p-2 border rounded-md"
                onChange={handleChange}
                value={formData.Account_status}
                required
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          )}

          <div>
            {!editingUser && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Password"
                className="p-2 border rounded-md col-span-2"
                onChange={handleChange}
                value={formData.confirmPassword}
                required
              />
            )}
          </div>

          <div className="col-span-2 flex items-center">
            <FaCamera className="mr-2 text-gray-500" />
            <input
              type="file"
              name="image"
              accept="image/*"
              className="p-2 border rounded-md"
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 col-span-2"
          >
            {editingUser ? "Update" : "Add"}
          </Button>
        </form>
        <button
          onClick={closeForm}
          className="mt-4 text-red-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RegUserMGT;

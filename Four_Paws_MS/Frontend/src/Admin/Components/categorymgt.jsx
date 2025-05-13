import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CategoryManagement = () => {
  const [categories, setcategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingcategory, setEditingcategories] = useState(null);

  const fetchcategories = async () => {
    const res = await axios.get(
      "http://localhost:3001/api/adminpetshop/categories"
    );
    setcategories(res.data);
  };

  useEffect(() => {
    fetchcategories();
  }, []);

  const deletecategory = async (category_id) => {
    try {
      if (window.confirm("Are you sure you want to delete this user?")) {
        const response = await axios.delete(
          `http://localhost:3001/api/adminpetshop/categorydelete?category_id=${category_id}`
        );
        alert(response.data.message);
        fetchcategories();
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
            setEditingcategories(null);
            setShowForm(true);
          }}
        >
          <FaPlus className="mr-2" /> Add Catagory
        </Button>
      </div>
      <div className="">
        <div className="overflow-y-auto max-h-[400px]">
          <table className="w-full text-left bg-gray-50 shadow-md">
            <thead className="bg-[#71C9CE] text-gray-900 sticky top-0 z-10">
              <tr>
                <th className="p-3 border-l-2">Category ID</th>
                <th className="p-3 border-l-2">Name</th>
                <th className="p-3 border-l-2">Status</th>
                <th className="p-3 border-l-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((u) => (
                <tr key={u.category_id} className="border-t">
                  <td className="p-3">{u.category_id}</td>
                  <td className="p-3">{u.category_name}</td>
                  <td
                    className={`p-3 ${
                      u.status != "Inactive"
                        ? "text-[#71C9CE] font-bold"
                        : "font-bold text-red-500"
                    }`}
                  >
                    {u.status}
                  </td>
                  <td className="p-3 space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingcategories(u);
                        setShowForm(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletecategory(u.category_id)}
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
            <CategoryForm
              closeForm={() => setShowForm(false)}
              editingcategory={editingcategory}
              refreshcategories={fetchcategories}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const CategoryForm = ({ closeForm, editingcategory, refreshcategories }) => {
  const [formData, setFormData] = useState({
    category_name: "",
    status: "Active",
  });

  useEffect(() => {
    if (editingcategory) setFormData(editingcategory);
  }, [editingcategory]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingcategory) {
        await axios.put(
          `http://localhost:3001/api/adminpetshop/categoryupdate?category_id=${editingcategory.category_id}`,
          formData
        );
        alert("profile updated!");
      } else {
        await axios.post(
          "http://localhost:3001/api/adminpetshop/addcategory",
          formData
        );
      }
      refreshcategories();
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
        {editingcategory ? "Edit" : "Register New"} Category
      </h2>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={handleSubmit}
      >
        <div>
          {editingcategory && (
            <label className="flex font-bold" htmlFor="Category Name">
              Category Name
            </label>
          )}
          <input
            type="text"
            name="category_name"
            placeholder="Category Name"
            className="p-2 border rounded-md"
            onChange={handleChange}
            value={formData.category_name}
            required
          />
        </div>

        {editingcategory && (
          <div>
            <label className="flex font-bold" htmlFor="stats">
              Status
            </label>
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
          </div>
        )}

        <Button
          type="submit"
          className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 col-span-2"
        >
          {editingcategory ? "Update" : "Add"}
        </Button>
      </form>
      <button onClick={closeForm} className="mt-4 text-red-500 hover:underline">
        Cancel
      </button>
      </div>
    </div>
  );
};

export default CategoryManagement;

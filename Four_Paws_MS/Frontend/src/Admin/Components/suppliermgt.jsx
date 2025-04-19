import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SupplierManagement = () => {
    const [suppliers, setsuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingsuppliers, setEditingsupplier] = useState(null);

  const fetchsuppliers = async () => {
    const res = await axios.get(
      "http://localhost:3001/api/adminpetshop/suppliers"
    );
    setsuppliers(res.data);
  };

  useEffect(() => {
    fetchsuppliers();
  }, []);

  const deletesupplier = async (supplier_id) => {
    try {
      if (window.confirm("Are you sure you want to delete this user?")) {
        const response = await axios.delete(
          `http://localhost:3001/api/adregform/supplierdelete?supplier_id=${supplier_id}`
        );
        alert(response.data.message);
        fetchsuppliers();
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
            setEditingsupplier(null);
            setShowForm(true);
          }}
        >
          <FaPlus className="mr-2" /> Add Supplier
        </Button>
      </div>
      <div className="">
        <div className="overflow-y-auto max-h-[400px]">
          <table className="w-full text-left bg-gray-50 shadow-md">
            <thead className="bg-[#71C9CE] text-gray-900 sticky top-0 z-10">
              <tr>
              <th className="p-3 border-l-2">Supplier ID</th>
                <th className="p-3 border-l-2">Name</th>
                <th className="p-3 border-l-2">Contact Info</th>
                <th className="p-3 border-l-2">Address</th>
                <th className="p-3 border-l-2">Status</th>
                <th className="p-3 border-l-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((u) => (
                <tr key={u.supplier_id} className="border-t">
                  <td className="p-3">
                    {u.supplier_id} 
                  </td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.contact_info}</td>
                  <td className="p-3">{u.address}</td>
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
                        setEditingsupplier(u);
                        setShowForm(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletesupplier(u.supplier_id)}
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
            <SupplierForm
              closeForm={() => setShowForm(false)}
              editingsuppliers={editingsuppliers}
              refreshsuppliers={fetchsuppliers}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const SupplierForm = ({ closeForm, editingsuppliers, refreshsuppliers }) => {
    const [formData, setFormData] = useState({
      name: "",
      contact_info: "",
      address: "",
     
    });
  
    useEffect(() => {
      if (editingsuppliers) setFormData(editingsuppliers);
    }, [editingsuppliers]);
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (editingsuppliers) {
          await axios.put(
            `http://localhost:3001/api/adminpetshop/supplierupdate?supplier_id=${editingsuppliers.supplier_id}`,
            formData
          );
          alert("profile updated!");
        } else {
          await axios.post(
            "http://localhost:3001/api/adminpetshop/addsupplier",
            formData
          );
        }
        refreshsuppliers();
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
          {editingsuppliers ? "Edit" : "Register New"} Supplier
        </h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="name"
            placeholder="Supplier Name"
            className="p-2 border rounded-md"
            onChange={handleChange}
            value={formData.name}
            required
          />
          <input
            type="text"
            name="contact_info"
            placeholder="Contact Information"
            className="p-2 border rounded-md"
            onChange={handleChange}
            value={formData.contact_info}
            required
          />
          
          {editingsuppliers && (
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
          
          <Button
            type="submit"
            className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 col-span-2"
          >
            {editingsuppliers ? "Update" : "Add"}
          </Button>
        </form>
        <button onClick={closeForm} className="mt-4 text-red-500 hover:underline">
          Cancel
        </button>
      </div>
    );
  };

  export default SupplierManagement;
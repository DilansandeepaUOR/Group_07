import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCamera } from "react-icons/fa";
import paw from "../../assets/paw_vector.png"

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    const res = await axios.get(
      "http://localhost:3001/api/adminpetshop/products"
    );
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (product_id) => {
    try {
      if (window.confirm("Are you sure you want to delete this user?")) {
        const response = await axios.delete(
          `http://localhost:3001/api/adminpetshop/productdelete?product_id=${product_id}`
        );
        alert(response.data.message);
        fetchProducts();
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
            setEditingProduct(null);
            setShowForm(true);
          }}
        >
          <FaPlus className="mr-2" /> Add New Product
        </Button>
      </div>
      <div className="">
        <div className="overflow-y-auto max-h-[400px]">
          <table className="w-full text-left bg-gray-50 shadow-md">
            <thead className="bg-[#71C9CE] text-gray-900 sticky top-0 z-10">
              <tr>
                <th className="p-3 border-l-2">Name</th>
                <th className="p-3 border-l-2">Category</th>
                <th className="p-3 border-l-2">Quantity</th>
                <th className="p-3 border-l-2">Price</th>
                <th className="p-3 border-l-2">Status</th>
                <th className="p-3 border-l-2">Actioins</th>
              </tr>
            </thead>
            <tbody>
              {products.map((u) => (
                <tr key={u.product_id} className="border-t">
                  <td className="p-3 ">{u.name}</td>
                  <td className="p-3">{u.category_name}</td>
                  <td className="p-3">{u.quantity_in_stock}</td>
                  <td className="p-3">Rs. {u.unit_price}</td>
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
                        setEditingProduct(u);
                        setShowForm(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteProduct(u.product_id)}
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
            <ProductForm
              closeForm={() => setShowForm(false)}
              editingProduct={editingProduct}
              refreshProducts={fetchProducts}
            />
          )}
        </div>
      </div>
      <div className="imagediv">

      </div>
      
    </div>
  );
};

const ProductForm = ({ closeForm, editingProduct, refreshProducts }) => {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    brand: "",
    description: "",
    quantity_in_stock: "",
    unit_price: "",
    supplier_id: "",
    status: "Active",
    image: null,
  });

  useEffect(() => {
    if (editingProduct) setFormData(editingProduct);
  }, [editingProduct]);

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
    for (let key in formData) {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    }
    try {
      if (editingProduct) {
        await axios.put(
          `http://localhost:3001/api/adminpetshop/productupdate?product_id=${editingProduct.product_id}`,
          submitData,
        { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("product updated!");
      } else {
        await axios.post(
          "http://localhost:3001/api/adminpetshop/addproduct",
          submitData,
        { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Product added")
      }
      refreshProducts();
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
        {editingProduct ? "Edit" : "Register New"} Product
      </h2>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.name}
          required
        />
        <input
          type="text"
          name="category_id"
          placeholder="Category id"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.category_id}
          required
        />
        <input
          type="text"
          name="brand"
          placeholder="Brand Name"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.brand}
          required
        />
        <input
          type="text"
          name="unit_price"
          placeholder="Unit Price"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.unit_price}
          required
        />

        <input
          type="text"
          name="supplier_id"
          placeholder="Supplier Id"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.supplier_id}
          required
        />

        <input
          type="text"
          name="quantity_in_stock"
          placeholder="Quantity"
          className="p-2 border rounded-md"
          onChange={handleChange}
          value={formData.quantity_in_stock}
          required
        />

        {editingProduct && (
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
          name="description"
          placeholder="Product Description"
          className="p-2 border rounded-md col-span-2"
          onChange={handleChange}
          value={formData.description}
        />

        <div className="col-span-2 flex items-center">
          <FaCamera className="mr-2 text-gray-500" />
          <input
            type="file"
            name="image"
            accept="image/*"
            className="p-2 border rounded-md"
            onChange={handleChange}
            required={!editingProduct}
          />
        </div>

        <Button
          type="submit"
          className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 col-span-2"
        >
          {editingProduct ? "Update" : "Add"}
        </Button>
      </form>
      <button onClick={closeForm} className="mt-4 text-red-500 hover:underline">
        Cancel
      </button>
    </div>
  );
};

export default ProductManagement;

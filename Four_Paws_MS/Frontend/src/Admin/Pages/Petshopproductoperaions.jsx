import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProductOperations = () => {
  const { id } = useParams(); // Get product_id from URL
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/adminpetshop/productsqr/${id}`
        );
        setProduct(res.data);
        setFormData(res.data); // Initialize form data with product data
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <p className="text-center text-gray-500">Loading...</p>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/adminpetshop/productsqr/${id}`,
        formData
      );
      alert("Product updated successfully!");
      setIsEditing(false);
      setProduct(formData); // Update the product state with the new data
    } catch (err) {
      console.error(err);
      alert("Failed to update product.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(
          `http://localhost:3001/api/adminpetshop/productsqr/${id}`
        );
        alert("Product deleted successfully!");
        navigate("/admin/petshop"); // Redirect to the pet shop page
      } catch (err) {
        console.error(err);
        alert("Failed to delete product.");
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#028478]">
        {isEditing ? "Edit Product" : product.name}
      </h2>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <img
          src={`http://localhost:3001${product.product_image}`}
          alt={product.name}
          className="w-48 h-48 object-cover rounded-lg shadow-md"
        />
        {isEditing ? (
          <div className="w-full space-y-4">
            <div>
              <label className="block font-bold mb-1 text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#028478]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-gray-700">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#028478]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-gray-700">
                Category
              </label>
              <input
                type="text"
                name="category_name"
                value={formData.category_name || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#028478]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-gray-700">
                Supplier
              </label>
              <input
                type="text"
                name="supplier_name"
                value={formData.supplier_name || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#028478]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                name="quantity_in_stock"
                value={formData.quantity_in_stock || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#028478]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-gray-700">Price</label>
              <input
                type="number"
                name="unit_price"
                value={formData.unit_price || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#028478]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#028478]"
              ></textarea>
            </div>
            <div>
              <label className="block font-bold mb-1 text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#028478]"
              >
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <p>
              <strong>Brand:</strong> {product.brand}
            </p>
            <p>
              <strong>Category:</strong> {product.category_name}
            </p>
            <p>
              <strong>Supplier:</strong> {product.supplier_name}
            </p>
            <p>
              <strong>Quantity:</strong> {product.quantity_in_stock}
            </p>
            <p>
              <strong>Price:</strong> Rs. {product.unit_price}
            </p>
            <p>
              <strong>Description:</strong> {product.description}
            </p>
            <p>
              <strong>Status:</strong> {product.status}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Edit Product
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductOperations;
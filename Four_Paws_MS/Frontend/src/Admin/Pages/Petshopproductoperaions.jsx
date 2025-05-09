import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";
import logo from "../../assets/logo.png"; // Adjust the path to your logo

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
        `http://localhost:3001/api/adminpetshop/productupdate?product_id=${id}`,
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
          `http://localhost:3001/api/adminpetshop/productdelete?product_id=${id}`
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
    <div className="min-h-screen bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] flex items-center justify-center">
      <div className="absolute top-5 left-5 object-cover w-[200px]">
        <img src={logo} alt="logo" />
      </div>
      <div className="p-6 max-w-4xl mx-auto bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] shadow-lg rounded-lg">
        <div>
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center mb-6 text-gray-900 hover:text-gray-400 cursor-pointer"
            >
              <FaTimes className="w-5 h-5 mr-2" /> Back
            </button>
          ) : (
            <button
              onClick={() => window.history.back()}
              className="flex items-center mb-6 text-gray-900 hover:text-gray-400 cursor-pointer"
            >
              <FaArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>
          )}
        </div>
        <h2 className="text-3xl font-bold mb-6 text-center text-[#028478]">
          {isEditing ? "Edit Product" : product.name}
        </h2>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {isEditing ? (
            <div className="w-full space-y-4">
              <div>
                <label className="block font-bold mb-1 text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#028478]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-gray-700">
                  Brand
                </label>
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
                <label className="block font-bold mb-1 text-gray-700">
                  Price
                </label>
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
                <label className="block font-bold mb-1 text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#028478]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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
              <table className="w-full text-left">
                <tr >
                  <td>
                    <strong>Brand:</strong>
                  </td>
                  <td>{product.brand}</td>
                </tr>
                <tr>
                  <td>
                  <strong>Category:</strong>
                  </td>
                  <td> {product.category_name}</td>
                </tr>
                <tr>
                  <td>
                  <strong>Quantity In Stock:</strong>
                  </td>
                  <td> {product.quantity_in_stock}</td>
                </tr>
                <tr>
                  <td>
                  <strong>Unit Price:</strong>
                  </td>
                  <td> Rs. {product.unit_price}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Status:</strong>
                  </td>
                  <td>{product.status}</td>
                </tr>
              </table>
              <div className="flex gap-2 mt-4 justify-center items-center">
                <label htmlFor="quantity">
                  <strong>Enter Quantity to IN or OUT</strong>
                </label>
                <input
                  type="text"
                  name="quantity"
                  placeholder="Quantity"
                  //value={formData.name}
                  //onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex gap-4 m-10">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#028478] text-white font-bold px-4 py-2 rounded hover:bg-[#396756] transition cursor-pointer"
                >
                  <FaArrowLeft className="w-5 h-5 ml-10" /> INVENTORY IN
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white font-bold px-4 py-2 rounded hover:bg-red-600 transition cursor-pointer"
                >
                  <FaArrowRight className="w-5 h-5 ml-12" /> INVENTORY OUT
                </button>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#028478] text-white px-4 py-2 rounded hover:bg-[#396756] transition cursor-pointer"
                >
                  Edit Product
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition cursor-pointer"
                >
                  Delete Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductOperations;

import React, { useState, useEffect } from "react";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import axios from "axios";
import paw from "../assets/paw_vector.png";

function Petshop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCaegories] = useState([]);

  const fetchProducts = async () => {
    const res = await axios.get(
      "http://localhost:3001/api/adminpetshop/products"
    );
    setProducts(res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get(
      "http://localhost:3001/api/adminpetshop/categories"
    );
    setCaegories(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Filtered product list based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category_name === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F]">
        {/* Hero Section */}
        <div className="relative py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[#A6E3E9] mb-4">
              Find Everything Your Pet Needs at Our Petshop
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Compassionate care for your beloved pets since 2021
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="container mx-auto px-4 mt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full placeholder-gray-300 text-gray-300 bg-[#22292F] md:w-1/2 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 caret-gray-300 focus:ring-[#028478]"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-gray-300 cursor-pointer bg-[#22292F] md:w-1/4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#028478]"
            >
              <option value="">All Categories</option>

              {categories.map((cat, index) => (
                <option key={index} value={cat.category_name}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Services Grid */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-transform"
                >
                  <h2 className="text-3xl font-bold text-[#028478] mb-4">
                    {product.name}
                  </h2>

                  <div className="flex items-center justify-center">
                    <img
                      src={
                        product.product_image
                          ? `http://localhost:3001${product.product_image}`
                          : paw
                      }
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop if paw image fails
                        e.target.src = paw;
                      }}
                    />
                  </div>
                  <p className="text-gray-600 mb-4">
                    <strong>Category: </strong>
                    {product.category_name}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <strong>Brand: </strong>
                    {product.brand}
                  </p>
                  <p
                    className={`text-gray-600 mb-4 ${
                      product.status !== "Inactive"
                        ? "font-bold"
                        : "font-bold text-red-500"
                    }`}
                  >
                    {product.status === "Active" ? (
                      <>
                        In Stock
                        <br />
                        {product.quantity_in_stock} Items Left
                      </>
                    ) : (
                      "Out of Stock"
                    )}
                  </p>
                  <div className="text-xl font-semibold text-gray-800 mb-2">
                    {product.description}
                  </div>
                  <p className="bg-[#028478] text-white px-6 py-2 rounded-full">
                    Rs. {product.unit_price}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-white col-span-3 text-center">
                No products found.
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Petshop;

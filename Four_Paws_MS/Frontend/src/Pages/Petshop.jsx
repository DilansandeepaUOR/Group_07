import React, { useState } from "react";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";

function Petshop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Example product list — replace with real data from API
  const products = [
    {
      name: "Premium Pet Food",
      category: "Food",
      price: 29.99,
      description: "High-quality, nutritious food for your beloved pet.",
    },
    {
      name: "Pet Toys Pack",
      category: "Toys",
      price: 14.99,
      description: "Fun and engaging toys for your furry friend.",
    },
    {
      name: "Pet Grooming Kit",
      category: "Grooming",
      price: 24.99,
      description: "Essential grooming tools for a clean pet.",
    },
  ];

  // Filtered product list based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
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
              className="w-full placeholder-white md:w-1/2 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#028478]"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-1/4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#028478]"
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Toys">Toys</option>
              <option value="Grooming">Grooming</option>
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
                  className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-transform"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {product.name}
                  </h2>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="text-3xl font-bold text-[#028478] mb-4">
                    ${product.price.toFixed(2)}
                  </div>
                  <button className="bg-[#028478] text-white px-6 py-2 rounded-full hover:bg-[#02665e] transition">
                    Buy Now
                  </button>
                </div>
              ))
            ) : (
              <p className="text-white col-span-3 text-center">No products found.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Petshop;

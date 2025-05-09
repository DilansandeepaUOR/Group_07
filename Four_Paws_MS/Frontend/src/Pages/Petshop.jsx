import React from "react";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";

function Petshop() {
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

        {/* Services Grid */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Pricing Card Example */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-transform">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Premium Pet Food
              </h2>
              <p className="text-gray-600 mb-4">
                High-quality, nutritious food for your beloved pet.
              </p>
              <div className="text-3xl font-bold text-[#028478] mb-4">
                $29.99
              </div>
              <button className="bg-[#028478] text-white px-6 py-2 rounded-full hover:bg-[#02665e] transition">
                Buy Now
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-transform">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Pet Toys Pack
              </h2>
              <p className="text-gray-600 mb-4">
                A collection of toys to keep your pet entertained.
              </p>
              <div className="text-3xl font-bold text-[#028478] mb-4">
                $14.99
              </div>
              <button className="bg-[#028478] text-white px-6 py-2 rounded-full hover:bg-[#02665e] transition">
                Buy Now
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-transform">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Pet Grooming Kit
              </h2>
              <p className="text-gray-600 mb-4">
                Everything you need to keep your pet looking great.
              </p>
              <div className="text-3xl font-bold text-[#028478] mb-4">
                $24.99
              </div>
              <button className="bg-[#028478] text-white px-6 py-2 rounded-full hover:bg-[#02665e] transition">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Petshop;

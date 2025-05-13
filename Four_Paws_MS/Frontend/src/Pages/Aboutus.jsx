import React from "react";
import {
  FaPaw,
  FaUserMd,
  FaHeart,
  FaAward,
  FaClinicMedical,
  FaHandHoldingHeart,
  FaBookMedical,
  FaUsers,
} from "react-icons/fa";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import shopimg from "../assets/about_us.jpeg";
import paw from "../assets/paw_vector.png";

function Aboutus() {
  const stats = [
    {
      value: "15+",
      label: "Years Experience",
      icon: <FaAward className="text-3xl text-[#028478]" />,
    },
    {
      value: "10K+",
      label: "Happy Pets",
      icon: <FaHeart className="text-3xl text-[#028478]" />,
    },
    {
      value: "5",
      label: "Veterinary Experts",
      icon: <FaUserMd className="text-3xl text-[#028478]" />,
    },
    {
      value: "24/7",
      label: "Emergency Care",
      icon: <FaClinicMedical className="text-3xl text-[#028478]" />,
    },
  ];

  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Head Veterinarian",
      icon: <FaUserMd className="text-4xl text-[#028478]" />,
    },
    {
      name: "Dr. Michael Chen",
      role: "Senior Veterinarian",
      icon: <FaUserMd className="text-4xl text-[#028478]" />,
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Veterinarian",
      icon: <FaUserMd className="text-4xl text-[#028478]" />,
    },
    {
      name: "Lisa Thompson",
      role: "Veterinary Technician",
      icon: <FaUserMd className="text-4xl text-[#028478]" />,
    },
  ];

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F]">
        {/* Hero Section */}
        <div className="relative py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[#A6E3E9] mb-4">
              About Four Paws Veterinary
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Compassionate care for your beloved pets since 2021
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div
          className="container mx-auto px-4 py-50 bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${shopimg})` }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] rounded-xl p-8">
              <div className="flex justify-center mb-4 w-16 h-16 mx-auto">
                <img src={paw} alt="paw" />
              </div>
              <p className="text-gray-600 mb-4 text-center">
                4Paws Animal Clinic, established on August 20, 2021, in
                Rathnapura, Sri Lanka, has become a beacon of hope and a trusted
                partner for pet owners. Dr. Damindu Wickramasinghe and Dr. Ushan
                Nirmal, the visionary founders, have created a haven for pets,
                offering comprehensive veterinary care and a commitment to
                animal welfare. As they continue to grow and expand their
                services, their impact on the community is sure to be felt for
                many more years to come, making Rathnapura a better place for
                pets and their loving owners.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}

        <div className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-gray-200 mb-12 text-center">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] rounded-xl shadow-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <FaHandHoldingHeart className="text-[#028478] text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-[#028478] mb-3">
                Compassionate Care
              </h3>
              <p className="text-gray-600">
                We treat every pet as if they were our own, with kindness and
                understanding.
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] rounded-xl shadow-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <FaBookMedical className="text-[#028478] text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-[#028478] mb-3">
                Medical Excellence
              </h3>
              <p className="text-gray-600">
                We maintain the highest standards through continuous education
                and advanced technology.
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] rounded-xl shadow-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <FaUsers className="text-[#028478] text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-[#028478] mb-3">
                Community Focus
              </h3>
              <p className="text-gray-600">
                We're committed to improving animal welfare through education
                and outreach programs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Aboutus;

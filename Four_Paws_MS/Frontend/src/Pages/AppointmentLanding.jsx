import React from "react";
import { Link } from "react-router-dom";
import { FaClinicMedical, FaAmbulance } from "react-icons/fa";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";

function AppointmentLanding() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#A6E3E9] mb-4">
              Book Your Appointment
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Choose the type of appointment that works best for you and your pet
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Clinic Appointment Card */}
            <Link to="/appointment" className="block">
              <div className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                <div className="p-8 flex flex-col items-center h-full">
                  <div className="bg-[#028478] text-white rounded-full p-6 mb-6">
                    <FaClinicMedical className="text-5xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#028478] mb-4">Clinic Appointment</h2>
                  <p className="text-gray-600 text-center mb-6">
                    Schedule a visit to our clinic for your pet's care. Our veterinarians will provide comprehensive examinations and treatments in our fully-equipped facility.
                  </p>
                  <div className="mt-auto">
                    <button className="bg-[#028478] text-white px-6 py-3 rounded-lg font-bold shadow-md transition duration-300 hover:bg-[#71C9CE] hover:text-[#000000]">
                      Book Clinic Visit
                    </button>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Mobile Service Card */}
            <Link to="/mobileservice" className="block">
              <div className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                <div className="p-8 flex flex-col items-center h-full">
                  <div className="bg-[#028478] text-white rounded-full p-6 mb-6">
                    <FaAmbulance className="text-5xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#028478] mb-4">Mobile Service</h2>
                  <p className="text-gray-600 text-center mb-6">
                    Our veterinarians come to you! Perfect for pets who get stressed during travel or if you have mobility constraints. We bring professional care directly to your doorstep.
                  </p>
                  <div className="mt-auto">
                    <button className="bg-[#028478] text-white px-6 py-3 rounded-lg font-bold shadow-md transition duration-300 hover:bg-[#71C9CE] hover:text-[#000000]">
                      Book Mobile Service
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="text-center mt-12">
            
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default AppointmentLanding; 
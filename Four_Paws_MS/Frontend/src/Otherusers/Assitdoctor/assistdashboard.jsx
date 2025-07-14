import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaNotesMedical,
  FaPills,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaMobileAlt,
  FaClock,
} from "react-icons/fa";
import axios from "axios";
import dp from "../../../src/assets/paw_vector.png";

// Import the components
import Appointments from "../Services/appointments";
import ServiceManagement from "../Services/serviceManagement";
import MobileService from "../Services/mobileService";
import TimeManagement from "../Services/ServiceTimeManagement"

const DoctorDashboard = () => {
  // Set the default active tab to "appointments"
  const [activeTab, setActiveTab] = useState("appointments");
  const [doctor, setDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/user", { withCredentials: true })
      .then((response) => {
        setDoctor(response.data);
      })
      .catch(() => {
        setDoctor(null);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      alert("Logged out!");
      setDoctor(null);
      window.location.href = "/Adlogin";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-[#71C9CE] text-gray-900 p-6 space-y-6">
        <h2 className="text-2xl font-bold">Doctor Dashboard</h2>

        <div className="items-center gap-4 mt-4">
          <img
            src={dp || "Doctor"}
            alt="Doctor"
            className="w-24 h-24 rounded-full border border-gray-400"
          />
          <div>
            <p className="text-black-300">
              <strong>Dr. {doctor?.fname} {doctor?.lname}</strong>
            </p>
            <p className="text-black-300">
              <strong>Specialization:</strong> Veterinary Medicine
            </p>
          </div>
        </div>

        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                activeTab === "appointments" ? "font-bold text-[#028478]" : ""
              }`}
            >
              <FaCalendarAlt /> Appointments
            </button>
          </li>
          {/* <li>
            <button
              onClick={() => setActiveTab("servicemanagement")}
              className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                activeTab === "servicemanagement" ? "font-bold text-[#028478]" : ""
              }`}
            >
              <FaUser /> Service Management
            </button>
          </li> */}
          {/* <li>
            <button
              onClick={() => setActiveTab("timemanagement")}
              className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                activeTab === "timemanagement" ? "font-bold text-[#028478]" : ""
              }`}
            >
              <FaClock /> Manage Time Slots
            </button>
          </li> */}
           
          <li>
            <button
              onClick={() => setActiveTab("mobile")}
              className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                activeTab === "mobile" ? "font-bold text-[#028478]" : ""
              }`}
            >
              <FaMobileAlt /> Mobile Service
            </button>
          </li>

          <li className="hover:text-red-400 items-center gap-2 w-full text-left">
            <a href="/Adlogin" onClick={handleLogout} className="flex items-center gap-2">
              <FaSignOutAlt /> Logout
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Tab Content - Default is Appointments */}
        {activeTab === "appointments" && <Appointments />}
        {activeTab === "timemanagement" && <TimeManagement />}
        {activeTab === "servicemanagement" && <ServiceManagement />}
        {activeTab === "mobile" && <MobileService />}
      </main>
    </div>
  );
};

export default DoctorDashboard;
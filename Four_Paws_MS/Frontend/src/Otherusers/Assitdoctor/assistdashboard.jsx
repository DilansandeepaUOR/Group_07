import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaNotesMedical,
  FaPills,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaMobileAlt,
} from "react-icons/fa";
import axios from "axios";
import dp from "../../../src/assets/paw_vector.png";

// Import the components
import Appointments from "./appointments";
import Patients from "./patients";
import Prescriptions from "./prescriptions";
import Medications from "./medications";
import MobileService from "./mobileService";

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
          <li>
            <button
              onClick={() => setActiveTab("patients")}
              className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                activeTab === "patients" ? "font-bold text-[#028478]" : ""
              }`}
            >
              <FaUser /> Patients
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("prescriptions")}
              className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                activeTab === "prescriptions" ? "font-bold text-[#028478]" : ""
              }`}
            >
              <FaNotesMedical /> Prescriptions
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("medications")}
              className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                activeTab === "medications" ? "font-bold text-[#028478]" : ""
              }`}
            >
              <FaPills /> Medications
            </button>
          </li>
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
        {/* Search Bar */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-4 text-gray-400" />
        </div>

        {/* Tab Content - Default is Appointments */}
        {activeTab === "appointments" && <Appointments />}
        {activeTab === "patients" && <Patients />}
        {activeTab === "prescriptions" && <Prescriptions />}
        {activeTab === "medications" && <Medications />}
        {activeTab === "mobile" && <MobileService />}
      </main>
    </div>
  );
};

export default DoctorDashboard;
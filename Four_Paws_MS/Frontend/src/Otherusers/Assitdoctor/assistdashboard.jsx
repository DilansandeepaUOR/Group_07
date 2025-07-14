import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaNotesMedical,
  FaPills,
  FaUser,
  FaSignOutAlt,
  FaSearch,

  FaUsers,

  FaMobileAlt,
  FaClock,

} from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
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
  const [pro_pic, setPro_pic] = useState(dp); // default profile picture

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/admins", { withCredentials: true })
      .then((response) => {
        setDoctor(response.data);
      })
      .catch(() => {
        setDoctor(null);
      });
  }, []);

  // Fetch profile picture once user is loaded
  useEffect(() => {
    if (user?.id) {
      axios
        .get(`http://localhost:3001/api/adprofile/?id=${user.id}`)
        .then((response) => {
          setPro_pic(response.data);
        })
        .catch(() => {
          setPro_pic(dp); // fallback to default profile picture
        });
    }
  }, [user]);

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
        <h2 className="text-2xl font-bold">Assistant Doctor Dashboard</h2>

        <div className="flex justify-center items-center w-full">
          <div className="flex flex-col items-center border-1 p-4 bg-gray-50 gap-4 mt-4">
            {/* Profile Picture */}
            <img
              src={`http://localhost:3001${pro_pic?.Pro_pic}` || dp}
              alt={user?.name}
              className="w-24 h-24 rounded-full border border-gray-400"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop if paw image fails
                e.target.src = dp;
              }}
            />

            {/* <img
              src={dp || "Admin"}
              alt="Admin"
              className="w-24 h-24 rounded-full border border-gray-400"
            /> */}
            <div>
              <p className="text-black-300">
                <strong>Assistant Doctor: </strong> {doctor?.fname}{" "}
                {doctor?.lname}
              </p>

              <div>
                <Link to={"/assistprofile"}>
                  <button
                    onClick={() => setActiveTab("profsetting")}
                    className="flex items-center gap-2 w-full text-left hover:text-[#71C9CE] cursor-pointer"
                  >
                    <FaUsers /> Profile Settings
                  </button>
                </Link>
              </div>
            </div>
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
            <a
              href="/Adlogin"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
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

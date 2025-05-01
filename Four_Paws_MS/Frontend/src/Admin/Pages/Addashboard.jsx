import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaPills,
  FaShoppingCart,
  FaPlus,
  FaUser,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dp from "../../../src/assets/paw_vector.png";
import { Link } from "react-router-dom";
import AdPetShopManagement from "../Components/adpetshop";
import AdUserManagement from "../Components/adusermanagement";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/admins", { withCredentials: true })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      alert("Logged out!");
      setUser(null);
      window.location.href = "/Adlogin";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] text-gray-900">
      <aside className="w-64 bg-[#71C9CE] text-gray-900 p-6 space-y-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>

        <div className="flex justify-center items-center w-full">
          <div className="flex flex-col items-center border-1 p-4 bg-gray-50 gap-4 mt-4">
            <img
              src={dp || "Admin"}
              alt="Admin"
              className="w-24 h-24 rounded-full border border-gray-400"
            />
            <div>
              <p className="text-black-300">
                <strong>Admin: </strong> {user?.fname} {user?.lname}
              </p>
              <div>
                <Link to={"/adprofile"}>
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

        <ul className="space-y-5">
          <li className="">
            <button
              onClick={() => setActiveTab("users")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-50 cursor-pointer"
            >
              <FaUsers /> Manage Users
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("pharmacy")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-50 cursor-pointer"
            >
              <FaPills /> Manage Pharmacy
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("petshop")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-50 cursor-pointer"
            >
              <FaShoppingCart /> Manage Pet Shop
            </button>
          </li>
          <li className="flex hover:text-red-400 items-center gap-2 w-full text-left">
            <a href="/Adlogin" onClick={handleLogout}>
              <FaSignOutAlt className="mr-2" /> Logout
            </a>
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-8">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "pharmacy" && <PharmacyManagement />}
        {activeTab === "petshop" && <PetShopManagement />}
      </main>
    </div>
  );
};

//user management section
const UserManagement = () => (
  <div>
    <AdUserManagement/>
  </div>
);

const PharmacyManagement = () => (
  <div>
    <h2 className="text-2xl font-semibold text-[#028478]">
      Pharmacy Management
    </h2>
    <p className="text-gray-700">Manage medicines and stock.</p>
  </div>
);

const PetShopManagement = () => (
  <div>
    <AdPetShopManagement />
  </div>
);

export default AdminDashboard;

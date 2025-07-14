import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaPills,
  FaShoppingCart,
  FaSignOutAlt,
  FaQrcode,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dp from "../../assets/paw_vector.png";
import { Link } from "react-router-dom";
import CategoryMGT from "../../Admin/Components/categorymgt";
import SupplierMGT from "../../Admin/Components/suppliermgt";
import ProductMGT from "../../Admin/Components/productmgt";
import QrMGT from "../../Admin/Components/qrscanner";

const psdashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [user, setUser] = useState(null);
  const [pro_pic, setPro_pic] = useState(dp); // default profile picture

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
                <strong>Admin: </strong> {user?.fname} {user?.lname}
              </p>
              <div>
                <Link to={"/psprofile"}>
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
              onClick={() => setActiveTab("products")}
              className="flex items-center gap-2 w-full text-left border-1 p-2 rounded-2xl hover:border-gray-900 hover:text-gray-50 cursor-pointer"
            >
              <FaShoppingCart /> Manage Products
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("categories")}
              className="flex items-center gap-2 w-full text-left border-1 p-2 rounded-2xl hover:border-gray-900 hover:text-gray-50 cursor-pointer"
            >
              <FaPills /> Manage Categories
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("suppliers")}
              className="flex items-center gap-2 w-full text-left border-1 p-2 rounded-2xl hover:border-gray-900 hover:text-gray-50 cursor-pointer"
            >
              <FaUsers /> Manage Suppliers
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("qr")}
              className="flex items-center gap-2 w-full text-left border-1 p-2 rounded-2xl hover:border-gray-900 hover:text-gray-50 cursor-pointer"
            >
              <FaQrcode /> QR Scanner
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
        {activeTab === "products" && <ProductManagement />}
        {activeTab === "categories" && <CategoryManagement />}
        {activeTab === "suppliers" && <SupplierManagement />}
        {activeTab === "qr" && <QrManagement />}
      </main>
    </div>
  );
};

const CategoryManagement = () => (
  <div>
    <h2 className="text-2xl font-semibold text-[#028478]">
      Category Management
    </h2>
    <CategoryMGT />
  </div>
);

const ProductManagement = () => (
  <div>
    <h2 className="text-2xl font-semibold text-[#028478]">
      Products Management
    </h2>
    <ProductMGT />
  </div>
);

const SupplierManagement = () => (
  <div>
    <h2 className="text-2xl font-semibold text-[#028478]">
      Supplier Management
    </h2>
    <SupplierMGT />
  </div>
);

const QrManagement = () => (
  <div>
    <h2 className="text-2xl font-semibold text-[#028478]">
      QR Scanner
    </h2>
    <QrMGT />
  </div>
);

export default psdashboard;

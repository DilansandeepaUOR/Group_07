import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaPills,
  FaShoppingCart,
  FaQrcode,
} from "react-icons/fa";
import CategoryMGT from "../Components/categorymgt";
import SupplierMGT from "../Components/suppliermgt";
import ProductMGT from "../Components/productmgt";
import QrMGT from "../Components/qrscanner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const adPetShopManagement = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("products");

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

return (
    <div className="relative">
        <h2 className="text-2xl font-semibold mb-4 text-[#028478]">
            Pet Shop Management
        </h2>
        <div className="flex h-20 my-10 justify-center items-center bg-[#71C9CE]">
            <ul className="flex gap-30">
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
            </ul>
        </div>
        <div className="">
            {activeTab === "products" && <ProductManagement />}
            {activeTab === "categories" && <CategoryManagement />}
            {activeTab === "suppliers" && <SupplierManagement />}
            {activeTab === "qr" && <QrManagement />}
        </div>
    </div>
);
};

const CategoryManagement = () => (
    <div>
        <CategoryMGT/>
    </div>
);

const ProductManagement = () => (
    <div>
        <ProductMGT/>
    </div>
);

const SupplierManagement = () => (
    <div>
        <SupplierMGT/>
    </div>
);

const QrManagement = () => (
    <div>
        <QrMGT/>
    </div>
);
export default adPetShopManagement;

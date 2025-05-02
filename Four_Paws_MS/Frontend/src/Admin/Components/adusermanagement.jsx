import React, { useState, useEffect } from "react";
import {

  FaPills,
  FaShoppingCart,

} from "react-icons/fa";
import AdUserMGT from "../Components/adusermgt";
import RegUserMGT from "../Components/regusermgt";
import axios from "axios";

const AdUserManagement = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("aduser");

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/admins", { withCredentials: true })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        console.error("Failed to fetch admin data:", error);
        setUser(null);
        setError("Failed to load admin data.");
      });
  }, []);

return (
    <div className="relative">
        <h2 className="text-2xl font-semibold mb-4 text-[#028478]">
            User Management
        </h2>
        <div className="flex h-20 my-10 justify-center items-center bg-[#71C9CE]">
            <ul className="flex gap-30">
                <li className="">
                    <button
                        onClick={() => setActiveTab("aduser")}
                        className="flex items-center gap-2 w-full text-left border-1 p-2 rounded-2xl hover:border-gray-900 hover:text-gray-50 cursor-pointer"
                    >
                        <FaShoppingCart /> Manage Admin Users
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setActiveTab("reguser")}
                        className="flex items-center gap-2 w-full text-left border-1 p-2 rounded-2xl hover:border-gray-900 hover:text-gray-50 cursor-pointer"
                    >
                        <FaPills /> Manage Regular Users
                    </button>
                </li>
            </ul>
        </div>
        <div className="">
            {activeTab === "aduser" && <AdUser />}
            {activeTab === "reguser" && <RegUser />}
        </div>
    </div>
);
};

const AdUser = () => (
    <div>
        <AdUserMGT/>
    </div>
);

const RegUser = () => (
    <div>
        <RegUserMGT/>
    </div>
);


export default AdUserManagement;
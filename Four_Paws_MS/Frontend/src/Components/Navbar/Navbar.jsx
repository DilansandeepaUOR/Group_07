import React, { useState, useEffect } from "react";
import "../../Styles/Navbar/Navbar.css";
import Navbarmenu from "./Navbarmenu";
import logo from "../../assets/logo.png";
import {
  FaHome,
  FaPaw,
  FaStore,
  FaEnvelope,
  FaInfoCircle,
  FaUserPlus,
  FaSignInAlt,
  FaBars,
} from "react-icons/fa";
import Regandsignbtn from "./regandsignbtn";
import Profilearea from "../Profilearea/Profilearea";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading]= useState(null);
  const navigate = useNavigate();
  const { unreadCount } = useNotification();

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/user", { withCredentials: true })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      alert("Logged out!");
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isLoggedIn = !!user;

  const menu = [
    { name: "HOME", icon: FaHome, to: "/" },
    { name: "OUR SERVICES", icon: FaPaw, to: "/Ourservices" },
    { name: "PET SHOP", icon: FaStore, to: "/Petshop" },
    { name: "CONTACT US", icon: FaEnvelope, to: "/Contactus" },
    { name: "ABOUT US", icon: FaInfoCircle, to: "/Aboutus" },
  ];

  const menubuttons = [
    { name: "Register", icon: FaUserPlus },
    { name: "Sign in", icon: FaSignInAlt },
  ];

  return (
    <nav>
      <div className="flex justify-between items-center p-5">
        {/* <!-- logo --> */}
        <div className="flex items-center gap-8 bg-[#22292F]">
          <a href="/">
            <img
              src={logo}
              alt="4paws logo"
              className="w-[200px] object-cover cursor-pointer"
            />
          </a>

          {/* <!-- nav bar buttons --> */}
          <div className="hidden lg:flex gap-8">
            {menu.map((item) => (
              <Navbarmenu
                key={item.name}
                name={item.name}
                Icon={item.icon}
                to={item.to}
              />
            ))}
          </div>

          {/* <!-- Responsive menu items --> */}
          <div className="lg:hidden" onClick={() => setShowMenu(!showMenu)}>
            <Navbarmenu name="MENU" Icon={FaBars} />
            {showMenu && (
              <div>
                <div className="absolute max-w-xs right-0 mt-[12px] bg-[#313940] border-[1px] border-[#313940] rounded-md px-5 py-3 sm:hidden">
                  {menu.map(
                    (item, index) =>
                      index >= 1 && (
                        <Navbarmenu
                          key={item.name}
                          name={item.name}
                          Icon={item.icon}
                          to={item.to}
                        />
                      )
                  )}
                  <div>
                    {isLoggedIn
                      ? null
                      : menubuttons.map((item) => (
                          <Regandsignbtn
                            key={item.name}
                            name={item.name}
                            Icon={item.icon}
                            onClick={() => {
                              if (item.name === "Sign in") {
                                navigate("/Login");
                              }
                              if (item.name === "Register") {
                                navigate("/Register");
                              }
                            }}
                          />
                        ))}
                  </div>
                </div>

                <div className="absolute mt-[12px] bg-[#313940] border-[1px] border-[#313940] rounded-md px-5 py-3 hidden sm:block">
                  {menu.map(
                    (item, index) =>
                      index >= 1 && (
                        <Navbarmenu
                          key={item.name}
                          name={item.name}
                          Icon={item.icon}
                          to={item.to}
                        />
                      )
                  )}
                  <div>
                    {isLoggedIn
                      ? null
                      : menubuttons.map((item) => (
                          <Regandsignbtn
                            key={item.name}
                            name={item.name}
                            Icon={item.icon}
                            onClick={() => {
                              if (item.name === "Sign in") {
                                navigate("/Login");
                              }
                              if (item.name === "Register") {
                                navigate("/Register");
                              }
                            }}
                          />
                        ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <!-- profile area --> */}
        {isLoggedIn ? (
          <div className="flex items-center ml-10 lg:ml-0">
            <Profilearea/>
          </div>
        ) : (
          <div>
            {/* <!-- register and signin buttons --> */}
            <div className="hidden lg:flex items-center gap-8">
              {menubuttons.map((item) => (
                    <div
                      key={item.name}
                      className={
                        item.name === "Register"
                          ? "bg-red-500 px-6 py-3 font-bold rounded-lg transition duration-300 hover:bg-red-600 transform hover:scale-105"
                          : "px-6 py-3 border rounded-lg transition duration-300 transform hover:scale-105"
                      }
                    >
                      <Regandsignbtn
                        name={item.name}
                        Icon={item.icon}
                        onClick={() => {
                          if (item.name === "Sign in") {
                            navigate("/Login");
                          }
                          if (item.name === "Register") {
                            navigate("/Register");
                          }
                        }}
                      />
                    </div>
                  ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-6 py-3 bg-white shadow">
        <div className="text-xl font-bold text-[#71C9CE]">Four Paws</div>
        <button className="relative">
          <Bell className="w-8 h-8 text-[#71C9CE]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

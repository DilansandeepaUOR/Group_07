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
import Login from "../../Pages/Login";
import Register from "../../Pages/Register";
import Profilearea from "../Profilearea/profilearea";
import axios from "axios";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const isLoggedIn = user !== null;

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

  // Fetch user data
  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/user", { withCredentials: true })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null); // No redirection, just set user to null
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      alert("Logged out!");
      setUser(null); // Reset user state after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav>
      <div className="flex justify-between items-center p-5">
        {/* Logo */}
        <div className="flex items-center gap-8 bg-[#22292F]">
          <a href="/">
            <img
              src={logo}
              alt="4paws logo"
              className="w-[200px] object-cover cursor-pointer"
            />
          </a>
        </div>

        {/* Navbar Buttons */}
        <div className="hidden lg:flex gap-8">
          {menu.map((item) => (
            <Navbarmenu key={item.name} name={item.name} Icon={item.icon} to={item.to} />
          ))}
        </div>

        {/* Responsive Menu */}
        <div className="lg:hidden" onClick={() => setShowMenu(!showMenu)}>
          <Navbarmenu name="MENU" Icon={FaBars} />
          {showMenu && (
            <div className="absolute max-w-xs right-0 mt-[12px] bg-[#313940] border-[1px] border-[#313940] rounded-md px-5 py-3">
              {menu.map((item) => (
                <Navbarmenu key={item.name} name={item.name} Icon={item.icon} to={item.to} />
              ))}
            </div>
          )}
        </div>

        {/* Conditional Rendering: Show Profilearea if logged in, otherwise show Register/Sign-in buttons */}
        <div className="hidden lg:flex items-center gap-8">
          {isLoggedIn ? (
            <Profilearea />
          ) : (
            menubuttons.map((item) => (
              <div
                key={item.name}
                className={`${
                  item.name === "Register"
                    ? "bg-red-500 px-6 py-3 font-bold rounded-lg transition duration-300 hover:bg-red-600 transform hover:scale-105"
                    : "px-6 py-3 border rounded-lg transition duration-300 transform hover:scale-105"
                }`}
              >
                <Regandsignbtn
                  name={item.name}
                  Icon={item.icon}
                  onClick={() => {
                    if (item.name === "Sign in") {
                      setShowLogin(true);
                    }
                    if (item.name === "Register") {
                      setShowRegister(true);
                    }
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Login and Register Modals */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </nav>
  );
}

export default Navbar;

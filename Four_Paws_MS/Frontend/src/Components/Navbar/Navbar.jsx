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
import Profilearea from "../Profilearea/Profilearea";
import axios from "axios";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3001/api/auth/user", { withCredentials: true })
      .then(response => {
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
      await axios.get("http://localhost:3001/api/auth/logout", { withCredentials: true });
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
              <Navbarmenu key={item.name} name={item.name} Icon={item.icon} to={item.to} />
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
                        <Navbarmenu key={item.name} name={item.name} Icon={item.icon} to={item.to} />
                      )
                  )}
                  <div>
                    {menubuttons.map((item) => (
                      <Regandsignbtn
                        key={item.name}
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
                    ))}
                  </div>
                </div>

                <div className="absolute mt-[12px] bg-[#313940] border-[1px] border-[#313940] rounded-md px-5 py-3 hidden sm:block">
                  {menu.map(
                    (item, index) =>
                      index >= 1 && (
                        <Navbarmenu key={item.name} name={item.name} Icon={item.icon} to={item.to} />
                      )
                  )}
                  <div>
                    {menubuttons.map((item) => (
                      <Regandsignbtn
                        key={item.name}
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
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <!-- register and signin buttons --> */}
        <div className="hidden lg:flex items-center gap-8">
          {isLoggedIn ? (
            <Profilearea />
          ) : (
            menubuttons.map((item) => (
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
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </nav>
  );
}

export default Navbar;

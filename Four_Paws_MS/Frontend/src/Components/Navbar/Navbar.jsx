import React from "react";
import "../../Styles/Navbar/Navbar.css";
import Navbarmenu from "./Navbarmenu";
import { useState } from "react";
import logo from "../../assets/logo.png";
import {
  FaHome,
  FaPaw,
  FaStore,
  FaPills,
  FaEnvelope,
  FaInfoCircle,
} from "react-icons/fa";

import { FaUserPlus, FaSignInAlt } from "react-icons/fa";
import Regandsignbtn from "./regandsignbtn";
import { FaBars } from "react-icons/fa";
import Login from "../../Pages/Login";
import Register from "../../Pages/Register";
import Profilearea from "../Profilearea/profilearea";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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
              <Navbarmenu name={item.name} Icon={item.icon} to={item.to} />
            ))}
          </div>

          <div className="flex lg:hidden gap-5">
            {menu.map(
              (item, index) =>
                index < 1 && <Navbarmenu Icon={item.icon} to={item.to} />
            )}
          </div>

          {/* <!-- Responsive menu items --> */}
          <div className="lg:hidden" onClick={() => setShowMenu(!showMenu)}>
            <Navbarmenu name="MENU" Icon={FaBars} />
            {showMenu ? (
              <div>
                <div className="absolute max-w-xs right-0 mt-[12px] bg-[#313940] border-[1px] border-[#313940] rounded-md px-5 py-3 sm:hidden">
                  {menu.map(
                    (item, index) =>
                      index >= 1 && (
                        <Navbarmenu
                          name={item.name}
                          Icon={item.icon}
                          to={item.to}
                        />
                      )
                  )}

                  <div className="">
                    {menubuttons.map((item) => (
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
                    ))}
                  </div>
                </div>

                <div className="absolute mt-[12px] bg-[#313940] border-[1px] border-[#313940] rounded-md px-5 py-3 hidden sm:block">
                  {menu.map(
                    (item, index) =>
                      index >= 1 && (
                        <Navbarmenu
                          name={item.name}
                          Icon={item.icon}
                          to={item.to}
                        />
                      )
                  )}

                  <div className="">
                    {menubuttons.map((item) => (
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
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* <!-- register and signin buttons --> */}
        <div className="hidden lg:flex items-center gap-8">
          {menubuttons.map((item) =>
            item.name === "Register" ? (
              <div className="bg-red-500 px-6 py-3 font-bold rounded-lg transition duration-300 hover:bg-red-600 transform hover:scale-105">
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
            ) : (
              <div className="px-6 py-3 border rounded-lg transition duration-300 transform hover:scale-105">
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
            )
          )}
        </div>
        <Profilearea/>
      </div>
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </nav>
  );
}

export default Navbar;

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

function Navbar() {

  const[showMenu, setShowMenu] = useState(false);

  const menu = [
    { name: "HOME", icon: FaHome },
    { name: "OUR SERVICES", icon: FaPaw },
    { name: "PET SHOP", icon: FaStore },
    { name: "PHARMACY", icon: FaPills },
    { name: "CONTACT US", icon: FaEnvelope },
    { name: "ABOUT US", icon: FaInfoCircle },
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
          <img
            src={logo}
            alt="4paws logo"
            className="w-[200px] object-cover cursor-pointer"
          />

          {/* <!-- nav bar buttons --> */}
          <div className="hidden md:flex gap-8">
            {menu.map((item) => (
              <Navbarmenu name={item.name} Icon={item.icon} />
            ))}
          </div>

          <div className="flex md:hidden gap-5">
            {menu.map(
              (item, index) =>
                index < 1 && <Navbarmenu name={item.name} Icon={item.icon} />
            )}
          </div>

          {/* <!-- responsive items --> */}
          <div className="md:hidden" onClick={() => setShowMenu(!showMenu)}>
            <Navbarmenu name="MENU" Icon={FaBars} />
            {showMenu ? <div className="absolute mt-[12px] bg-[#313940] border-[1px] border-[#313940] rounded-md px-5 py-3">
              {menu.map(
                (item, index) =>
                  index >= 1 && <Navbarmenu name={item.name} Icon={item.icon} />
              )}

              <div>
              {menubuttons.map((item) => (
                <Regandsignbtn name={item.name} Icon={item.icon}/>
              ))}
              </div>
            </div>: null}
          </div>
        </div>
        
        {/* <!-- register and signin buttons --> */}
        <div className="hidden md:flex items-center gap-8">
          {menubuttons.map((item) => (
            <Regandsignbtn name={item.name} Icon={item.icon} />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

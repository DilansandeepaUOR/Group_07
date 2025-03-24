import React from "react";
import "../../Styles/Navbar/Navbar.css";
import logo from "../../assets/logo.png";
import {
  FaHome,
  FaPaw,
  FaStore,
  FaPills,
  FaEnvelope,
  FaInfoCircle,
} from "react-icons/fa";
import Navbarmenu from "./Navbarmenu";

function Navbar() {
  const menu = [
    { name: "HOME", icon: FaHome },
    { name: "OUR SERVICES", icon: FaPaw },
    { name: "PET SHOP", icon: FaStore },
    { name: "PHARMACY", icon: FaPills },
    { name: "CONTACT US", icon: FaEnvelope },
    { name: "ABOUT US", icon: FaInfoCircle },
  ];

  return (
    <nav>
      <div className="flex justify-between items-center gap-8 bg-[#22292F]">
        <img src={logo} alt="4paws logo" className="w-[200px] object-cover" />

        
          {menu.map((item) => (
            <Navbarmenu name={item.name} Icon={item.icon} />
          ))}
        
      </div>
    </nav>
  );
}

export default Navbar;

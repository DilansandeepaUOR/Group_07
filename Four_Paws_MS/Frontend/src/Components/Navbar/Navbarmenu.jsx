import React from "react";
import { Link } from "react-router-dom";

function Navbarmenu({ name, Icon, to }) {
  return (
    <Link to={to}>
    <div className="text-white py-2 flex items-center gap-3 text-[16px] Poppins cursor-pointer hover:underline underline-offset-8 hover:text-[#69cac2]">
      <Icon />
      <h2 className="font-Poppins">{name}</h2>
    </div>
    </Link>
  );
}

export default Navbarmenu;

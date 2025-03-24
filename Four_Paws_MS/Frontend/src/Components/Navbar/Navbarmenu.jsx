import React from "react";

function Navbarmenu({ name, Icon }) {
  return (
    <div className="text-white flex items-center gap-3 text-[16px]">
      <Icon />
      <h2 className="font-Poppins">{name}</h2>
    </div>
  );
}

export default Navbarmenu;

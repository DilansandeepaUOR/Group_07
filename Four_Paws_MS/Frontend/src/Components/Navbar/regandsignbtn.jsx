import React from 'react'

function Regandsignbtn({ name, Icon }) {
  return (
    <div>
        <div className="text-white flex items-center gap-3 text-[16px] cursor-pointer hover:underline underline-offset-8 hover:text-[#69cac2] mb-3">
            <Icon />
            <h2 className="font-Poppins">{name}</h2>
        </div>
    </div>
  )
}

export default Regandsignbtn
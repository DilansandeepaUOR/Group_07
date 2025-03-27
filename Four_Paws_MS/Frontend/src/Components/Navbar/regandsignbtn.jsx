import React from 'react'

function Regandsignbtn({ name, Icon, onClick }) {
  return (
    <div>
        <div className="text-white flex items-center gap-3 text-[16px] Poppins cursor-pointer hover:underline underline-offset-8 hover:text-[#69cac2]" onClick={onClick}>
            
            <Icon />
            <h2 className="font-Poppins">{name}</h2>
        </div>
    </div>
  )
}

export default Regandsignbtn
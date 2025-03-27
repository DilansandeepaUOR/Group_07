import React from 'react'

function Regandsignbtn({ name, Icon }) {
  return (
    <div>
        <div className="text-white flex items-center gap-3 text-[16px] Poppins cursor-pointer hover:underline underline-offset-8 mb-3 border-2 rounded-2xl px-4 py-2 mt-5 Poppins hover:bg-red-500 hover:font-bold hover:text-[#22292F]">
            <Icon />
            <h2 className="font-Poppins">{name}</h2>
        </div>
    </div>
  )
}

export default Regandsignbtn
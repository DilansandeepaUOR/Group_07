import React from 'react'

function Regandsignbtn({ name, Icon }) {
  return (
    <div>
        <div className="text-white items-center gap-3 text-[16px] font-bold cursor-pointer">
            <Icon />
            <h2 className="font-Poppins">{name}</h2>
        </div>
    </div>
  )
}

export default Regandsignbtn
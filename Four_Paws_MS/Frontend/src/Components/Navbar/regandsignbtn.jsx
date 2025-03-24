import React from 'react'

function regandsignbtn({ name, Icon }) {
return (
    <div className='text-white flex items-center gap-3 text-[16px] cursor-pointer'>
            <Icon/>
            <h2>{name}</h2>
    </div>
)
}

export default regandsignbtn
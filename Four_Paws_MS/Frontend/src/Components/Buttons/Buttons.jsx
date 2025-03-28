import React from 'react'

function Buttons(props) {
const {label,css } = props;

  return (

      <button className={css}>
        <span className="label px-1">{label}</span>
      </button>
 
  )
}

export default Buttons
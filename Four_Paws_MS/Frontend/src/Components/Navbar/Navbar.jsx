import React from 'react'
import '../../Styles/Navbar/Navbar.css'
import logo from '../../assets/logo.png'

function Navbar() {
  return (
    <nav>
        <img src={logo} alt="" />
        <ul>
            <li>Home</li>
            <li>Our Services</li>
            <li>Pet Shop</li>
            <li>Pharmacy</li>
            <li>Contact Us</li>
            <li>About Us</li>
        </ul>
    </nav>
  )
}

export default Navbar
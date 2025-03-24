import React from 'react'
import '../../Styles/Navbar/Navbar.css'
import logo from '../../assets/logo.png'
import { Button } from "flowbite-react";

function Navbar() {
  return (
    <nav>
      <Button color="blue">Click Me</Button>;
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
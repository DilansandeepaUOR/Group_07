import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Home from './Pages/Home'
import Footer from './Components/Footer/Footer'
import Aboutus from './Pages/Aboutus'
import Contactus from './Pages/Contactus'
import Ourservices from './Pages/Ourservices'
import Petshop from './Pages/Petshop'
import Pharmacy from './Pages/Pharmacy'
 

const App = () => {
  return (
    <>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Aboutus" element={<Aboutus />} />
        <Route path="/Contactus" element={<Contactus />} />
        <Route path="/Ourservices" element={<Ourservices />} />
        <Route path="/Petshop" element={<Petshop />} />
        <Route path="/Pharmacy" element={<Pharmacy />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
      <Footer/>
      </>
      
    
  )
}

export default App

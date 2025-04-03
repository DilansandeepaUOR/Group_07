import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Aboutus from './Pages/Aboutus'
import Contactus from './Pages/Contactus'
import Ourservices from './Pages/Ourservices'
import Petshop from './Pages/Petshop'
import Pharmacy from './Pages/pharmacy/main.jsx'
import Profile from './Pages/Profile'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Appointment from './Pages/Appointment'
import AppointmentDetails from './Pages/ap'
import RecordsEntry from './Pages/RecordsEntry'
import Adlogin from './Admin/Pages/adlogin'
import Addashboard from './Admin/Pages/Addashboard'
import EditRecords from './Pages/EditRecords'
import SearchRecords from './Pages/SearchRecords'

const App = () => {
  return (
    <>
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Aboutus" element={<Aboutus />} />
        <Route path="/Contactus" element={<Contactus />} />
        <Route path="/Ourservices" element={<Ourservices />} />
        <Route path="/Petshop" element={<Petshop />} />
        <Route path="/Pharmacy" element={<Pharmacy />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Profile" element={<Profile/>}/>
        <Route path="/appointment" element={<Appointment/>}/>
        <Route path="/RecordsEntry" element={<RecordsEntry/>}/>
        <Route path="/test" element={<AppointmentDetails/>}/>
        <Route path="/records" element={<RecordsEntry />} />
        <Route path="/edit/:id" element={<EditRecords />} />
        <Route path="/search" element={<SearchRecords />} />
        

        {/* Admin logins  */}
        <Route path="/Adlogin" element={<Adlogin/>}/>
        <Route path="/Addashboard" element={<Addashboard/>}/>



        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
      
      </>
      
    
  )
}

export default App

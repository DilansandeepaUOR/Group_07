import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Aboutus from "./Pages/Aboutus";
import Contactus from "./Pages/Contactus";
import Ourservices from "./Pages/Ourservices";
import Petshop from "./Pages/Petshop";
import Pharmacy from "./Pages/pharmacy/main.jsx";
import Profile from "./Pages/Profile";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Appointment from "./Pages/Appointment";
import RecordsEntry from "./Pages/RecordsEntry";
import Adlogin from "./Admin/Pages/Adlogin";
import Addashboard from "./Admin/Pages/Addashboard";
import Psprofile from "./Otherusers/Petshopper/psprofile";
import Docprofile from "./Otherusers/Doctor/docprofile";
import Assistprofile from "./Otherusers/Assitdoctor/assistprofile";
import EditRecords from "./Pages/EditRecords";
import SearchRecords from "./Pages/SearchRecords";
import Adprofile from "./Admin/Pages/Adprofile";
import ProtectedRoutes from "./Components/ProtectedRoutes/ProtectedRoutes";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Aboutus" element={<Aboutus />} />
        <Route path="/Contactus" element={<Contactus />} />
        <Route path="/Ourservices" element={<Ourservices />} />
        <Route path="/Petshop" element={<Petshop />} />
        <Route path="/Pharmacy" element={<ProtectedRoutes><Pharmacy /></ProtectedRoutes>} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/appointment" element={<ProtectedRoutes><Appointment /></ProtectedRoutes>} />
        <Route path="/RecordsEntry" element={<ProtectedRoutes><RecordsEntry /></ProtectedRoutes>} />
        <Route path="/records" element={<ProtectedRoutes><RecordsEntry /></ProtectedRoutes>} />
        <Route path="/edit/:id" element={<ProtectedRoutes><EditRecords /></ProtectedRoutes>} />
        <Route path="/search" element={<ProtectedRoutes><SearchRecords /></ProtectedRoutes>} />

        {/* Admin logins  */}
        <Route path="/Adlogin" element={<Adlogin />} />
        <Route path="/Addashboard" element={<ProtectedRoutes allowedRoles={["Admin"]}><Addashboard /></ProtectedRoutes>} />
        <Route path="/psprofile" element={<ProtectedRoutes><Psprofile /></ProtectedRoutes>} />
        <Route path="/docprofile" element={<ProtectedRoutes allowedRoles={["Doctor"]}><Docprofile /></ProtectedRoutes>} />
        <Route path="/assistprofile" element={<ProtectedRoutes><Assistprofile /></ProtectedRoutes>} />
        <Route path="/adprofile" element={<ProtectedRoutes allowedRoles={["Admin"]}><Adprofile /></ProtectedRoutes>} />

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
};

export default App;

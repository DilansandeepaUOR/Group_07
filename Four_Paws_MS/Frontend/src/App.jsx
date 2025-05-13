import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoutes from "./Components/ProtectedRoutes/ProtectedRoutes";
import ProtectedRoutesUser from "./Components/ProtectedRoutes/ProtectedRoutesUser";

// Main Pages
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
import Mobileservice from "./Pages/MobileService";

// Records Pages
import EditRecords from "./Pages/EditRecords";
import SearchRecords from "./Pages/SearchRecords";
import PetRecordPDF from "./Pages/PetRecordPDF";
import AllRecords from "./Pages/AllRecords";
import RecordEdit from "./Pages/RecordEdit";
import RecordNew from "./Pages/RecordNew";

// Admin Pages
import Adlogin from "./Admin/Pages/Adlogin";
import AdDashboard from "./Admin/Pages/Addashboard";
import Adprofile from "./Admin/Pages/Adprofile";
import PsOperations from "./Admin/Pages/Petshopproductoperaions";

// Other User Pages
import DoctorDashboard from "./Otherusers/Doctor/docdashboard";
import Docprofile from "./Otherusers/Doctor/docprofile";
import AssistDashboard from "./Otherusers/Assitdoctor/assistdashboard";
import Assistprofile from "./Otherusers/Assitdoctor/assistprofile";
import Psprofile from "./Otherusers/Petshopper/psprofile";
import PsDashboard from "./Otherusers/Petshopper/psdashboard";

// Miscellaneous
import Unauth from "./Pages/Unauth";
import ReportsSection from "./Components/Pharmacy/Reports";

const App = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/Aboutus" element={<Aboutus />} />
        <Route path="/Contactus" element={<Contactus />} />
        <Route path="/Ourservices" element={<Ourservices />} />
        <Route path="/Petshop" element={<Petshop />} />
        {/* <Route path="/Pharmacy" element={<Pharmacy />} /> */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Adlogin" element={<Adlogin />} />
        <Route path="/mobileservice" element={<Mobileservice />} />
        <Route path="/unauth" element={<Unauth />} />

        {/* Records Routes */}
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/recordselection" element={<PetRecordPDF />} />
        <Route path="/recordsNew" element={<AllRecords />} />
        <Route path="/records/edit/:id" element={<RecordEdit />} />
        <Route path="/records/new" element={<RecordNew />} />
        <Route path="/edit/:id" element={<EditRecords />} />
        <Route path="/search" element={<SearchRecords />} />
        <Route path="/Reports" element={<ReportsSection />} />

        {/* Protected Petowner Routes */}
        <Route 
          path="/Profile" 
          element={
            <ProtectedRoutesUser allowedRolesUser={["Petowner"]}>
              <Profile />
            </ProtectedRoutesUser>
          } 
        />
        <Route 
          path="/RecordsEntry" 
          element={
            <ProtectedRoutesUser allowedRolesUser={["Petowner"]}>
              <RecordsEntry />
            </ProtectedRoutesUser>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/Addashboard" 
          element={
            <ProtectedRoutes allowedRoles={["Admin"]}>
              <AdDashboard />
            </ProtectedRoutes>
          } 
        />
        <Route 
          path="/adprofile" 
          element={
            <ProtectedRoutes allowedRoles={["Admin"]}>
              <Adprofile />
            </ProtectedRoutes>
          } 
        />
        <Route 
          path="/Addashboard/adminpetshop/petshopproductoperations/:id" 
          element={
            <ProtectedRoutes allowedRoles={["Admin"]}>
              <PsOperations />
            </ProtectedRoutes>
          } 
        />

        {/* Protected Other User Routes */}
        <Route 
          path="/psdashboard" 
          element={
            <ProtectedRoutes allowedRoles={["Pet Shopper"]}>
              <PsDashboard />
            </ProtectedRoutes>
          } 
        />
        <Route 
          path="/psprofile" 
          element={
            <ProtectedRoutes allowedRoles={["Pet Shopper"]}>
              <Psprofile />
            </ProtectedRoutes>
          } 
        />
        <Route 
          path="/docdashboard" 
          element={
            <ProtectedRoutes allowedRoles={["Doctor"]}>
              <DoctorDashboard />
            </ProtectedRoutes>
          } 
        />
        <Route 
          path="/docprofile" 
          element={
            <ProtectedRoutes allowedRoles={["Doctor"]}>
              <Docprofile />
            </ProtectedRoutes>
          } 
        />
        <Route 
          path="/assistdashboard" 
          element={
            <ProtectedRoutes allowedRoles={["Assistant Doctor"]}>
              <AssistDashboard />
            </ProtectedRoutes>
          } 
        />
        <Route 
          path="/assistprofile" 
          element={
            <ProtectedRoutes allowedRoles={["Assistant Doctor"]}>
              <Assistprofile />
            </ProtectedRoutes>
          } 
        />
        <Route 
          path="/pharmacy" 
          element={
            <ProtectedRoutes allowedRoles={["Pharmacist"]}>
              <Pharmacy />
            </ProtectedRoutes>
          } 
        />

        {/* 404 Route */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
};

export default App;
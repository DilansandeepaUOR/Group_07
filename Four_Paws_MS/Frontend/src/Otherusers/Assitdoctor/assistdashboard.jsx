import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  FaCalendarAlt,
  FaNotesMedical,
  FaPills,
  FaUser,
  FaSignOutAlt,
  FaSearch,

  FaUsers,

  FaMobileAlt,
  FaClock,
  FaDog,

} from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import dp from "../../../src/assets/paw_vector.png";

// Import the components
import Appointments from "../Services/appointments";
import ServiceManagement from "../Services/serviceManagement";
import MobileService from "../Services/mobileService";
import TimeManagement from "../Services/ServiceTimeManagement"

// Import medications components
const PetRecordPDF = lazy(() => import("../../Pages/PetRecordPDF"));
const NewRecord = lazy(() => import("../../Pages/RecordNew"));
const ViewRecords = lazy(() => import("../../Pages/AllRecords"));
const Notify = lazy(() => import("../../Pages/VaccineNotify"));
const SentNotify = lazy(() => import("../../Pages/VaccineSent"));
const RecordEdit = lazy(() => import("../../Pages/RecordEdit"));

// Import deworming components
const DewormNew = lazy(() => import("../../Pages/DewormNew"));
const DewormRecords = lazy(() => import("../../Pages/DewormRecords"));
const DewormEdit = lazy(() => import("../../Pages/DewormEdit"));
const DewormNotify = lazy(() => import("../../Pages/DewormNotify"));
const DewormNotifications = lazy(() => import("../../Pages/DewormingSent"));

// --- Icon for Success Popup ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-green-500 mx-auto"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

// --- Success Popup Component ---
const SuccessPopup = ({ title, message, onClose }) => (
    <div 
        className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
        <div className="bg-white rounded-lg shadow-2xl p-8 m-4 max-w-sm w-full text-center">
            <CheckCircleIcon />
            <h3 className="text-2xl font-bold text-gray-800 mt-4">{title}</h3>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
                onClick={onClose}
                className="cursor-pointer mt-6 w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
            >
                Close
            </button>
        </div>
    </div>
);

const DoctorDashboard = () => {
  // Set the default active tab to "appointments"
  const [activeTab, setActiveTab] = useState("appointments");
  const [doctor, setDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pro_pic, setPro_pic] = useState(dp); // default profile picture
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [showRecordSuccess, setShowRecordSuccess] = useState(false);
  const [showDewormSuccess, setShowDewormSuccess] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/admins", { withCredentials: true })
      .then((response) => {
        setDoctor(response.data);
      })
      .catch(() => {
        setDoctor(null);
      });
  }, []);

  // Fetch profile picture once user is loaded
  useEffect(() => {
    if (doctor?.id) {
      axios
        .get(`http://localhost:3001/api/adprofile/?id=${doctor.id}`)
        .then((response) => {
          setPro_pic(response.data);
        })
        .catch(() => {
          setPro_pic(dp); // fallback to default profile picture
        });
    }
  }, [doctor]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      alert("Logged out!");
      setDoctor(null);
      window.location.href = "/Adlogin";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleEditRecord = (recordId) => {
    setEditingRecordId(recordId);
    setActiveTab("medications");
  };

  const handleCancelEdit = () => {
    setEditingRecordId(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return <Appointments />;
      case "timemanagement":
        return <TimeManagement />;
      case "servicemanagement":
        return <ServiceManagement />;
      case "mobile":
        return <MobileService />;
      case "medications":
        return (
          <MedicationsSection
            onEditRecord={handleEditRecord}
            editingRecordId={editingRecordId}
            onCancelEdit={handleCancelEdit}
            onRecordSaved={() => setShowRecordSuccess(true)}
          />
        );
      case "deworming":
        return (
          <DewormingSection onRecordSaved={() => setShowDewormSuccess(true)} />
        );
      default:
        return <Appointments />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] text-gray-900">
      {/* Wrap main content to apply blur effect */}
      <div className={`flex flex-1 ${showRecordSuccess || showDewormSuccess ? 'blur-sm' : ''}`}>
        {/* Sidebar */}
        <aside className="w-64 bg-[#71C9CE] text-gray-900 p-6 space-y-6">
          <h2 className="text-2xl font-bold">Assistant Doctor Dashboard</h2>

          <div className="flex justify-center items-center w-full">
            <div className="flex flex-col items-center border-1 p-4 bg-gray-50 gap-4 mt-4">
              {/* Profile Picture */}
              <img
                src={`http://localhost:3001${pro_pic?.Pro_pic}` || dp}
                alt={doctor?.name}
                className="w-24 h-24 rounded-full border border-gray-400"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop if paw image fails
                  e.target.src = dp;
                }}
              />

              {/* <img
                src={dp || "Admin"}
                alt="Admin"
                className="w-24 h-24 rounded-full border border-gray-400"
              /> */}
              <div>
                <p className="text-black-300">
                  <strong>Assistant Doctor: </strong> {doctor?.fname}{" "}
                  {doctor?.lname}
                </p>

                <div>
                  <Link to={"/assistprofile"}>
                    <button
                      onClick={() => setActiveTab("profsetting")}
                      className="flex items-center gap-2 w-full text-left hover:text-[#71C9CE] cursor-pointer"
                    >
                      <FaUsers /> Profile Settings
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                  activeTab === "appointments" ? "font-bold text-[#028478]" : ""
                }`}
              >
                <FaCalendarAlt /> Appointments
              </button>
            </li>
            
            <li>
              <button
                onClick={() => setActiveTab("mobile")}
                className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                  activeTab === "mobile" ? "font-bold text-[#028478]" : ""
                }`}
              >
                <FaMobileAlt /> Mobile Service
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab("medications")}
                className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                  activeTab === "medications" ? "font-bold text-[#028478]" : ""
                }`}
              >
                <FaPills /> Medications
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("deworming")}
                className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                  activeTab === "deworming" ? "font-bold text-[#028478]" : ""
                }`}
              >
                <FaDog /> Deworming
              </button>
            </li>
            {/* <li>
              <button
                onClick={() => setActiveTab("servicemanagement")}
                className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                  activeTab === "servicemanagement" ? "font-bold text-[#028478]" : ""
                }`}
              >
                <FaUser /> Service Management
              </button>
            </li> */}
            {/* <li>
              <button
                onClick={() => setActiveTab("timemanagement")}
                className={`flex items-center gap-2 w-full text-left hover:text-gray-700 ${
                  activeTab === "timemanagement" ? "font-bold text-[#028478]" : ""
                }`}
              >
                <FaClock /> Manage Time Slots
              </button>
            </li> */}
             
            

            <li className="hover:text-red-400 items-center gap-2 w-full text-left">
              <a
                href="/Adlogin"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </a>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>

      {/* Render the popup here, on top of everything */}
      {showDewormSuccess && <SuccessPopup onClose={() => setShowDewormSuccess(false)} />}

      {showRecordSuccess && (
        <SuccessPopup 
          title="Success!"
          message="The medical record has been saved successfully."
          onClose={() => setShowRecordSuccess(false)} 
        />
      )}
    </div>
  );
};

// Deworming
const DewormingSection = ({ onRecordSaved}) => {
  const [activeSubTab, setActiveSubTab] = useState("new");

const renderSubContent = () => {
    switch (activeSubTab) {
      case "new":
        return (
          <div className="bg-white p-4 rounded shadow mt-4">
            <Suspense fallback={<div>Loading New Deworming Form...</div>}>
              <DewormNew onSuccess={onRecordSaved} />
            </Suspense>
          </div>
        );
      case "view":
        return (
          <div className="bg-white p-4 rounded shadow mt-4">
            <Suspense fallback={<div>Loading Records...</div>}> 
                <DewormRecords />
            </Suspense>
          </div>
        );
        case "templates":
        return (
          <div className="bg-white p-4 rounded shadow mt-4">
            <Suspense fallback={<div>Loading Deworming Templates...</div>}>
              <DewormNotify />
            </Suspense>
          </div>
        );
      case "notify":
        return (
          <div className="bg-white p-4 rounded shadow mt-4">
            <Suspense fallback={<div>Loading Notifications...</div>}>
              <DewormNotifications />
            </Suspense>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#028478]">Deworming</h2>
      <div className="flex overflow-x-auto mt-4 space-x-4">
        {[
          { key: "view", label: "View Deworming Records" },,
          { key: "notify", label: "Deworming Notifications" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={` cursor-pointer px-4 py-2 rounded hover:bg-green-400 ${
              activeSubTab === tab.key
                ? "bg-[#028478] text-white"
                : "bg-white border border-[#028478] text-[#028478]"
            }`}
            onClick={() => {setActiveSubTab(tab.key);}}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {renderSubContent()}
      </div>
    </div>
  );
};

// Medications with sub-slider
const MedicationsSection = ({ onEditRecord, editingRecordId, onCancelEdit, onRecordSaved }) => {
  const [activeSubTab, setActiveSubTab] = useState("new");

  const renderSubContent = () => {
    switch (activeSubTab) {
      case "pdf":
        return (
          <div className="bg-white p-4 rounded shadow mt-4">
            <Suspense fallback={<div>Loading PDF Generator...</div>}>
              <PetRecordPDF />
            </Suspense>
          </div>
        );
      case "view":
        return (
          <div className="bg-white p-4 rounded shadow mt-4">
            <Suspense fallback={<div>Loading All Records...</div>}>
              <ViewRecords onEdit={onEditRecord} />
            </Suspense>
          </div>
        );
      // case "new":
      //   return (
      //     <div className="bg-white p-4 rounded shadow mt-4">
      //       <Suspense fallback={<div>Loading Form...</div>}>
      //         {/* Pass the handler to the NewRecord component */}
      //         <NewRecord onSuccess={onRecordSaved} />
      //       </Suspense>
      //     </div>
      //   );
      case "notify":
        return (
          <div className="bg-white p-4 rounded shadow mt-4">
            <Suspense fallback={<div>Loading Notifications...</div>}>
              <Notify />
            </Suspense>
          </div>
        );
      case "sentnotify":
        return (
          <div className="bg-white p-4 rounded shadow mt-4">
            <Suspense fallback={<div>Loading Notifications...</div>}>
              <SentNotify />
            </Suspense>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#028478]">Medications</h2>

      <div className="flex overflow-x-auto mt-4 space-x-4">
        {[
          { key: "pdf", label: "Generate PDF" },
          { key: "view", label: "View Records" },
          { key: "sentnotify", label: "Notifications" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={` cursor-pointer px-4 py-2 rounded hover:bg-green-400 ${
              activeSubTab === tab.key
                ? "bg-[#028478] text-white"
                : "bg-white border border-[#028478] text-[#028478]"
            }`}
            onClick={() => {
              setActiveSubTab(tab.key);
              onCancelEdit();
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="mt-6">
        {editingRecordId ? (
          <Suspense fallback={<div>Loading Editor...</div>}>
            <RecordEdit id={editingRecordId} onCancel={onCancelEdit} />
          </Suspense>
        ) : (
          renderSubContent()
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

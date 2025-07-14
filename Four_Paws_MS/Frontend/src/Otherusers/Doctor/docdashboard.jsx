import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  FaCalendarAlt,
  FaMobileAlt,
  FaPills,
  FaSignOutAlt,

  FaUsers,

  FaDog,

} from "react-icons/fa";
import axios from "axios";
import dp from "../../../src/assets/paw_vector.png";
import { Link } from "react-router-dom";
const PetRecordPDF = lazy(() => import("../../Pages/PetRecordPDF"));
const NewRecord = lazy(() => import("../../Pages/RecordNew"));
const ViewRecords = lazy(() => import("../../Pages/AllRecords"));
const Notify = lazy(() => import("../../Pages/VaccineNotify"));
const SentNotify = lazy(() => import("../../Pages/VaccineSent"));

import Appointment from '../Services/appointments'
import MobileService from '../Services/mobileService'

const EditRecord = lazy(() => import("../../Pages/RecordEdit"));
const DewormNew = lazy(() => import("../../Pages/DeWormNew"));
const DewormRecords = lazy(() => import("../../Pages/DewormRecords"));
const DewormEdit = lazy(() => import("../../Pages/DewormEdit"));
const DewormNotify = lazy(() => import("../../Pages/DewormNotify"));
const DewormNotifications = lazy(() => import("../../Pages/DewormingSent"));

// --- Icon for Success Popup ---
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-16 w-16 text-green-500 mx-auto"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);


// --- Success Popup Component with Backdrop Blur ---
const SuccessPopup = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
    style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
  >
    <div className="bg-white rounded-lg shadow-2xl p-8 m-4 max-w-sm w-full text-center">
      <CheckCircleIcon />
      <h3 className="text-2xl font-bold text-gray-800 mt-4">Success!</h3>
      <p className="text-gray-600 mt-2">
        The deworming record has been saved successfully.
      </p>
      <button
        onClick={onClose}
        className="mt-6 w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
      >
        Close
      </button>

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
  </div>
);






const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("medications");
  const [doctor, setDoctor] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);
  // ADDED: State to control the deworming success popup
  const [showDewormSuccess, setShowDewormSuccess] = useState(false);

  const [pro_pic, setPro_pic] = useState(dp);
=======
  const [showRecordSuccess, setShowRecordSuccess] = useState(false);
  



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
    if (user?.id) {
      axios
        .get(`http://localhost:3001/api/adprofile/?id=${user.id}`)
        .then((response) => {
          setPro_pic(response.data);
        })
        .catch(() => {
          setPro_pic(dp); // fallback to default profile picture
        });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      alert("Logged out!");
      setDoctor(null);
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
        return <Appointment />;
      case "mobile":
        return <MobileService />;
        return <AppointmentsSection />;
      case "deworming":
        // MODIFIED: Pass a handler to show the success popup
        return (
          <DewormingSection onRecordSaved={() => setShowDewormSuccess(true)} />
        );
      case "medications":
        return (
          <MedicationsSection
            onEditRecord={handleEditRecord}
            editingRecordId={editingRecordId}
            onCancelEdit={handleCancelEdit}
            onRecordSaved={() => setShowRecordSuccess(true)}
          />
        );
      default:
        return (
          <Appointment />
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] text-gray-900">

      {/* Wrap main content to apply blur effect */}
      <div className={`flex flex-1 ${showDewormSuccess ? "blur-sm" : ""}`}>
        {/* Sidebar */}
        <aside className="w-64 bg-[#71C9CE] text-gray-900 p-6 space-y-6">
          <h2 className="text-2xl font-bold">Doctor Dashboard</h2>
          <div className="flex justify-center items-center w-full">
            <div className="flex flex-col items-center border-1 p-4 bg-gray-50 gap-4 mt-4">
              {/* Profile Picture */}

        {/* Wrap main content to apply blur effect */}
        <div className={`flex flex-1 ${showDewormSuccess || showRecordSuccess ? 'blur-sm' : ''}`}>
          {/* Sidebar */}
          <aside className="w-64 bg-[#71C9CE] text-gray-900 p-6 space-y-6">
            <h2 className="text-2xl font-bold">Doctor Dashboard</h2>


        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setActiveTab("appointments")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700 cursor-pointer"
            >
              <FaCalendarAlt /> Appointments
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("mobile")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700 cursor-pointer"
            >
              <FaMobileAlt /> Mobile Service
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("medications")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700 cursor-pointer"
            >
              <FaPills /> Medications
            </button>
          </li>
          <li className="hover:text-red-400 items-center gap-2 w-full text-left cursor-pointer">
            <a href="/Adlogin" onClick={handleLogout}>
              <FaSignOutAlt className="mr-2" /> Logout
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{renderContent()}</main>
            <div className="items-center gap-4 mt-4">

              <img
                src={`http://localhost:3001${pro_pic?.Pro_pic}` || dp}
                alt={user?.name}
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
                  <Link to={"/docprofile"}>
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
                onClick={() => {
                  setActiveTab("appointments");
                  setEditingRecordId(null);
                }}
                className="flex items-center gap-2 w-full text-left hover:text-gray-700 cursor-pointer"
              >
                <FaCalendarAlt /> Appointments
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab("deworming");
                  setEditingRecordId(null);
                }}
                className="flex items-center gap-2 w-full text-left hover:text-gray-700 cursor-pointer"
              >
                <FaUser /> Deworming
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("medications")}
                className="flex items-center gap-2 w-full text-left hover:text-gray-700 cursor-pointer"
              >
                <FaPills /> Medications
              </button>
            </li>
            <li className="hover:text-red-400 items-center gap-2 w-full text-left cursor-pointer">
              <a href="/Adlogin" onClick={handleLogout}>
                <FaSignOutAlt className="mr-2" /> Logout
              </a>
            </li>
          </ul>
        </aside>

            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("appointments");
                    setEditingRecordId(null);
                  }}
                  className="cursor-pointer flex items-center gap-2 w-full text-left hover:text-gray-700 cursor-pointer"
                >
                  <FaCalendarAlt /> Appointments
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("deworming");
                    setEditingRecordId(null);
                  }}
                  className="cursor-pointer flex items-center gap-2 w-full text-left hover:text-gray-700"
                >
                  <FaDog /> Deworming
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("medications")}
                  className="flex items-center gap-2 w-full text-left hover:text-gray-700 cursor-pointer"
                >
                  <FaPills /> Medications
                </button>
              </li>
              <li className="hover:text-red-400 items-center gap-2 w-full text-left cursor-pointer">
                <a href="/Adlogin" onClick={handleLogout}>
                  <FaSignOutAlt className="mr-2" /> Logout
                </a>
              </li>
            </ul>
          </aside>


        {/* Main Content */}
        <main className="flex-1 p-8">{renderContent()}</main>
      </div>

      {/* Render the popup here, on top of everything */}

      {showDewormSuccess && (
        <SuccessPopup onClose={() => setShowDewormSuccess(false)} />

      {showDewormSuccess && <SuccessPopup onClose={() => setShowDewormSuccess(false)} />}

        {showRecordSuccess && (<SuccessPopup 
          title="Success!"
          message="The medical record has been saved successfully."
          onClose={() => setShowRecordSuccess(false)} 
        />

      )}
    </div>
  );
};

// Appointments
// const AppointmentsSection = () => (
//   <div>
//     <h2 className="text-2xl font-semibold text-[#028478]">Appointments</h2>
//     <p className="mt-4">Appointments area.</p>
//   </div>
// );


// Patients
// const PatientsSection = () => (
//   <div>
//     <h2 className="text-2xl font-semibold text-[#028478]">Patients</h2>
//     <p className="mt-4">Patient area</p>
//   </div>
// );
// Deworming
const DewormingSection = ({ onRecordSaved}) => {
  const [activeSubTab, setActiveSubTab] = useState("new");


  const renderSubContent = () => {

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
          { key: "new", label: "Add new Deworming Record" },
          { key: "view", label: "View Deworming Records" },
          { key: "templates", label: "Deworming Templates" },
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

      {/* MODIFIED: Removed incorrect logic and simplified the rendering */}
      <div className="mt-6">{renderSubContent()}</div>

      <div className="mt-6">
        {renderSubContent()}
      </div>

    </div>
  );
};


// Medications with sub-slider
const MedicationsSection = ({
  onEditRecord,
  editingRecordId,
  onCancelEdit,
}) => {



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
      case "new":
        return (
          <div className="bg-white p-4 rounded shadow mt-4">
            <Suspense fallback={<div>Loading Form...</div>}>
              {/* Pass the handler to the NewRecord component */}
              <NewRecord onSuccess={onRecordSaved} />
            </Suspense>
          </div>
        );
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
          { key: "new", label: "New Record" },
          { key: "notify", label: "Templates" },
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
            <EditRecord id={editingRecordId} onCancel={onCancelEdit} />
          </Suspense>
        ) : (
          renderSubContent()
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

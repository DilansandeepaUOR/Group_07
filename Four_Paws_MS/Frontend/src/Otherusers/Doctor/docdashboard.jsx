import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  FaCalendarAlt,
  FaUser,
  FaPills,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import dp from "../../../src/assets/paw_vector.png";
import { Link } from "react-router-dom";
const PetRecordPDF = lazy(() => import("../../Pages/PetRecordPDF"));
const NewRecord = lazy(() => import("../../Pages/RecordNew"));
const ViewRecords = lazy(() => import("../../Pages/AllRecords"));
const Notify = lazy(() => import("../../Pages/VaccineNotify"));
const SentNotify = lazy(() => import("../../Pages/VaccineSent"));
const EditRecord = lazy(() => import("../../Pages/RecordEdit"));

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("medications"); // Default to medications for clarity
  const [doctor, setDoctor] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);

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
    // REMOVED: The `if (editingRecordId)` block has been removed from here.
    switch (activeTab) {
      case "appointments":
        return <AppointmentsSection />;
      case "patients":
        return <PatientsSection />;
      case "medications":
        // MODIFIED: Pass the editing ID and the cancel handler down to MedicationsSection.
        return (
          <MedicationsSection
            onEditRecord={handleEditRecord}
            editingRecordId={editingRecordId}
            onCancelEdit={handleCancelEdit}
          />
        );
      default:
        return (
          <div>
            <h2 className="text-2xl font-semibold text-[#028478]">
              Welcome to the Doctor Dashboard
            </h2>
            <p className="mt-4">
              Please select a section from the sidebar to get started.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-[#71C9CE] text-gray-900 p-6 space-y-6">
        <h2 className="text-2xl font-bold">Doctor Dashboard</h2>

        <div className="items-center gap-4 mt-4">
          <img
            src={dp || "Doctor"}
            alt="Doctor"
            className="w-24 h-24 rounded-full border border-gray-400"
          />
          <div>
            <p className="text-black-300">
              <strong>Dr. </strong> {doctor?.fname} {doctor?.lname}
            </p>
            <p className="text-black-300">
              <strong>E-mail:</strong> {doctor?.email}
            </p>
          </div>
        </div>

        <ul className="space-y-4">
          <li>
            <button
              onClick={() => {
                setActiveTab("appointments");
                setEditingRecordId(null); // Clear editing state when changing tabs
              }}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700 cursor-pointer"
            >
              <FaCalendarAlt /> Appointments
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setActiveTab("patients");
                setEditingRecordId(null); // Clear editing state when changing tabs
              }}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700 cursor-pointer"
            >
              <FaUser /> Patients
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
  );
};

// Appointments
const AppointmentsSection = () => (
  <div>
    <h2 className="text-2xl font-semibold text-[#028478]">Appointments</h2>
    <p className="mt-4">Appointments area.</p>
  </div>
);

// Patients
const PatientsSection = () => (
  <div>
    <h2 className="text-2xl font-semibold text-[#028478]">Patients</h2>
    <p className="mt-4">Patient area</p>
  </div>
);

// Medications with sub-slider
// MODIFIED: Accept the new props.
const MedicationsSection = ({ onEditRecord, editingRecordId, onCancelEdit }) => {
  const [activeSubTab, setActiveSubTab] = useState("view");

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
              <NewRecord />
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

      {/* Subcategory Slider */}
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
            className={`px-4 py-2 rounded ${
              activeSubTab === tab.key
                ? "bg-[#028478] text-white"
                : "bg-white border border-[#028478] text-[#028478]"
            }`}
            onClick={() => {
              setActiveSubTab(tab.key);
              onCancelEdit(); // Clear editing state if user clicks a sub-tab
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Subcategory Content */}
      {/* MODIFIED: Add logic here to show EditRecord or the sub-content */}
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
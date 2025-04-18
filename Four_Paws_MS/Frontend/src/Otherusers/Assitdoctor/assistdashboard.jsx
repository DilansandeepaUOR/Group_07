import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaNotesMedical,
  FaPills,
  FaUser,
  FaSignOutAlt,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dp from "../../../src/assets/paw_vector.png";

const assistdashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [doctor, setDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/user", { withCredentials: true })
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
      window.location.href = "/Adlogin";
    } catch (err) {
      console.error("Logout failed:", err);
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
              <strong>Dr. {doctor?.fname} {doctor?.lname}</strong>
            </p>
            <p className="text-black-300">
              <strong>Specialization:</strong> Veterinary Medicine
            </p>
          </div>
        </div>

        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setActiveTab("appointments")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700"
            >
              <FaCalendarAlt /> Appointments
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("patients")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700"
            >
              <FaUser /> Patients
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("prescriptions")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700"
            >
              <FaNotesMedical /> Prescriptions
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("medications")}
              className="flex items-center gap-2 w-full text-left hover:text-gray-700"
            >
              <FaPills /> Medications
            </button>
          </li>

          <li className="hover:text-red-400 items-center gap-2 w-full text-left">
            <a href="/Adlogin" onClick={handleLogout} className="">
              <FaSignOutAlt className="mr-2" /> Logout
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-4 text-gray-400" />
        </div>

        {/* Tab Content */}
        {activeTab === "appointments" && <Appointments />}
        {activeTab === "patients" && <Patients />}
        {activeTab === "prescriptions" && <Prescriptions />}
        {activeTab === "medications" && <Medications />}
      </main>
    </div>
  );
};

// Appointments Component
const Appointments = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      petName: "Max",
      owner: "John Doe",
      date: "2023-11-15",
      time: "10:00 AM",
      reason: "Annual Checkup",
      status: "Confirmed",
    },
    {
      id: 2,
      petName: "Bella",
      owner: "Jane Smith",
      date: "2023-11-15",
      time: "11:30 AM",
      reason: "Vaccination",
      status: "Confirmed",
    },
    {
      id: 3,
      petName: "Charlie",
      owner: "Mike Johnson",
      date: "2023-11-16",
      time: "09:00 AM",
      reason: "Skin Allergy",
      status: "Pending",
    },
  ]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-[#028478]">
        Today's Appointments
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">Total Appointments</p>
          <p className="text-3xl font-bold text-[#028478]">12</p>
        </div>
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">Completed</p>
          <p className="text-3xl font-bold text-[#028478]">8</p>
        </div>
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">Pending</p>
          <p className="text-3xl font-bold text-[#028478]">4</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-[#71C9CE]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Pet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.petName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {appointment.owner}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {appointment.date} at {appointment.time}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {appointment.reason}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[#028478] hover:text-[#71C9CE] mr-3">
                    View
                  </button>
                  <button className="text-[#028478] hover:text-[#71C9CE]">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Patients Component
const Patients = () => {
  const [showAddPatient, setShowAddPatient] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#028478]">Patients</h2>
        <Button
          className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 flex items-center"
          onClick={() => setShowAddPatient(true)}
        >
          <FaPlus className="mr-2" /> Add Patient
        </Button>
      </div>

      {showAddPatient && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 text-[#028478]">
            Add New Patient
          </h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Pet Name"
              className="p-2 border rounded-md"
              required
            />
            <select className="p-2 border rounded-md" required>
              <option>Select Species</option>
              <option>Dog</option>
              <option>Cat</option>
              <option>Bird</option>
              <option>Rabbit</option>
              <option>Other</option>
            </select>
            <input
              type="text"
              placeholder="Breed"
              className="p-2 border rounded-md"
              required
            />
            <input
              type="date"
              placeholder="Date of Birth"
              className="p-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Owner Name"
              className="p-2 border rounded-md"
              required
            />
            <input
              type="tel"
              placeholder="Owner Phone"
              className="p-2 border rounded-md"
              required
            />
            <textarea
              placeholder="Medical History"
              className="p-2 border rounded-md col-span-2"
              rows="3"
            ></textarea>
            <Button
              type="submit"
              className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 col-span-2"
            >
              Register Patient
            </Button>
          </form>
          <button
            onClick={() => setShowAddPatient(false)}
            className="mt-4 text-red-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full bg-[#71C9CE] flex items-center justify-center text-white font-bold mr-3">
                {item}
              </div>
              <div>
                <h3 className="font-semibold">Patient {item}</h3>
                <p className="text-sm text-gray-600">Dog • Labrador</p>
              </div>
            </div>
            <div className="text-sm text-gray-700 mb-3">
              <p>
                <span className="font-medium">Owner:</span> Owner Name
              </p>
              <p>
                <span className="font-medium">Last Visit:</span> 2023-11-01
              </p>
            </div>
            <div className="flex justify-between">
              <button className="text-[#028478] hover:text-[#71C9CE] text-sm">
                View Records
              </button>
              <button className="text-[#028478] hover:text-[#71C9CE] text-sm">
                Add Note
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Prescriptions Component
const Prescriptions = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-[#028478]">
        Prescriptions
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-[#028478]">
            Recent Prescriptions
          </h3>
          <Button className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900">
            <FaPlus className="mr-2" /> New Prescription
          </Button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Prescription #{item}</h4>
                  <p className="text-sm text-gray-600">
                    For: Patient {item} • Date: 2023-11-{10 + item}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-[#028478] hover:text-[#71C9CE] text-sm">
                    View
                  </button>
                  <button className="text-[#028478] hover:text-[#71C9CE] text-sm">
                    Print
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <h5 className="text-sm font-medium mb-1">Medications:</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Medication A - 1 tablet daily</li>
                  <li>• Medication B - 2ml every 12 hours</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Medications Component
const Medications = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-[#028478]">Medications</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">Total Medications</p>
          <p className="text-3xl font-bold text-[#028478]">42</p>
        </div>
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">In Stock</p>
          <p className="text-3xl font-bold text-[#028478]">35</p>
        </div>
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">Low Stock</p>
          <p className="text-3xl font-bold text-[#028478]">5</p>
        </div>
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">Out of Stock</p>
          <p className="text-3xl font-bold text-[#028478]">2</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-[#71C9CE]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Medication
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((item) => (
              <tr key={item}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Medication {item}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {["Antibiotic", "Painkiller", "Vaccine", "Supplement", "Antiparasitic"][item % 5]}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item * 5} in stock
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${(item * 5.5).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[#028478] hover:text-[#71C9CE]">
                    Prescribe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default assistdashboard;
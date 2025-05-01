import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";

const Patients = () => {
  const [showAddPatient, setShowAddPatient] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#028478]">Patients</h2>
        
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

export default Patients;
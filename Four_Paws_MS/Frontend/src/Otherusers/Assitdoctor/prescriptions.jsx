import React from 'react';
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";

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

export default Prescriptions;
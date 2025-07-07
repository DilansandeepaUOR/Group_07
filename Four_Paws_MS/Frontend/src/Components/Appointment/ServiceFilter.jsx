import React from "react";
import { FaClinicMedical, FaAmbulance } from "react-icons/fa";

const ServiceFilter = ({
  serviceType,
  setServiceType,
  statusFilter,
  setStatusFilter,
  onBookClinic,
  onBookMobile
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-[#A6E3E9] font-medium mb-2">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-gray-300 rounded-md text-gray-200 focus:ring-2 focus:ring-[#A6E3E9] focus:border-transparent"
            >
              <option value="all">All Services</option>
              <option value="clinic">Clinic Appointments</option>
              <option value="mobile">Mobile Services</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[#A6E3E9] font-medium mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-gray-300 rounded-md text-gray-200 focus:ring-2 focus:ring-[#A6E3E9] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onBookClinic}
            className="px-6 py-2 bg-[#A6E3E9] text-[#22292F] rounded-lg font-bold hover:bg-[#71C9CE] transition duration-300 flex items-center gap-2"
          >
            <FaClinicMedical />
            Book Clinic
          </button>
          <button
            onClick={onBookMobile}
            className="px-6 py-2 bg-[#A6E3E9] text-[#22292F] rounded-lg font-bold hover:bg-[#71C9CE] transition duration-300 flex items-center gap-2"
          >
            <FaAmbulance />
            Book Mobile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceFilter; 
import React from "react";
import { FaClinicMedical, FaAmbulance } from "react-icons/fa";
import { formatDate, getStatusColor } from "./utils";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/Components/ui/alert-dialog";

const ServiceListItem = ({
  item,
  isCancelling,
  cancellingAppointmentId,
  onCancel
}) => {
  const isCancellingThis = isCancelling && cancellingAppointmentId === item.displayId;
  const canCancel = item.displayStatus !== "Cancelled" && item.displayStatus !== "Completed";

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${item.type === "clinic" ? "bg-[#A6E3E9]/20" : "bg-[#71C9CE]/20"}`}>
            {item.type === "clinic" ? (
              <FaClinicMedical className="text-[#A6E3E9] text-xl" />
            ) : (
              <FaAmbulance className="text-[#71C9CE] text-xl" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#A6E3E9]">
              #{item.displayId} - {item.displayName}
            </h3>
            <p className="text-sm text-gray-300">
              {item.type === "clinic" ? "Clinic Appointment" : "Mobile Service"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.displayStatus)}`}>
            {item.displayStatus}
          </span>
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isCancellingThis}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                >
                  {isCancellingThis ? "Cancelling..." : "Cancel"}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel {item.type === "clinic" ? "Appointment" : "Mobile Service"}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this {item.type === "clinic" ? "appointment" : "mobile service"}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Go Back</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel} disabled={isCancellingThis} className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500" style={{}} variant="destructive">
                    {isCancellingThis ? "Cancelling..." : "Yes, Cancel"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="block text-[#A6E3E9]  mb-1">Date</span>
          <span className="text-gray-200">{formatDate(item.displayDate)}</span>
        </div>
        <div>
          <span className="block text-[#A6E3E9]  mb-1">Time</span>
          <span className="text-gray-200">{item.displayTime}</span>
        </div>
        <div>
          <span className="block text-[#A6E3E9]  mb-1">Service</span>
          <span className="text-gray-200">{item.displayReason}</span>
        </div>
        <div>
          <span className="block text-[#A6E3E9]  mb-1">Location</span>
          <span className={
            `truncate ${item.displayType === 'coordinates' ? 'text-blue-600 underline' : 'text-gray-200'}`
          }>
            {item.displayLocation}
          </span>
        </div>
      </div>

      {item.additional_note && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <span className="block text-[#A6E3E9]  mb-1">Additional Notes</span>
          <span className="text-gray-200">{item.additional_note}</span>
        </div>
      )}
    </div>
  );
};

export default ServiceListItem; 
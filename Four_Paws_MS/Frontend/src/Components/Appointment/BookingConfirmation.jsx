import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { CheckCircle, Home } from "lucide-react";
import { convertTimeFormat } from "./utils";

const BookingConfirmation = ({ 
  appointment,
  onBack
}) => {
  if (!appointment) return null;

  return (
    <Card className="shadow-lg border-t-4 border-t-[#008879]">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center justify-center mb-2">
          <CheckCircle className="h-12 w-12 text-[#008879]" />
        </div>
        <CardTitle className="text-xl text-center">Appointment Booked Successfully!</CardTitle>
        <CardDescription className="text-center">Your appointment has been confirmed</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100 mb-6">
            <p className="text-center text-green-700">
              Your appointment has been scheduled successfully. Please arrive 10 minutes before your appointment time.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-4">Appointment Details</h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm text-gray-500">Appointment ID:</div>
                <div className="text-sm font-medium col-span-2">{appointment.appointment_id}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm text-gray-500">Status:</div>
                <div className="text-sm font-medium col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {appointment.status || "Confirmed"}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm text-gray-500">Pet:</div>
                <div className="text-sm font-medium col-span-2">{appointment.pet_name || appointment.petType}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm text-gray-500">Reason:</div>
                <div className="text-sm font-medium col-span-2">{appointment.reason}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm text-gray-500">Date:</div>
                <div className="text-sm font-medium col-span-2">{new Date(appointment.date).toLocaleDateString()}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm text-gray-500">Time:</div>
                <div className="text-sm font-medium col-span-2">{convertTimeFormat(appointment.time)}</div>
              </div>
              
              {appointment.additional_note && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-gray-500">Additional Notes:</div>
                  <div className="text-sm font-medium col-span-2">{appointment.additional_note}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 flex justify-center">
        <Button 
          onClick={onBack}
          className="bg-[#008879] hover:bg-[#07776b] text-white"
        >
          <Home className="mr-1 h-4 w-4" />
          Return to Appointments
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingConfirmation; 
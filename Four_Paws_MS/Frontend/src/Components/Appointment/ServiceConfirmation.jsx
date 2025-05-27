import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Check, MapPin } from "lucide-react";

const ServiceConfirmation = ({ 
  selectedDate,
  selectedTime,
  onReturnHome,
  address
}) => {
  return (
    <Card className="shadow-lg border-t-4 border-t-green-500">
      <CardHeader className="bg-slate-50 border-b text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
        <CardDescription>Your mobile service appointment has been scheduled</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 text-center">
        <div className="space-y-6 max-w-md mx-auto">
          <div className="p-4 bg-green-50 border border-green-100 rounded-md">
            <p className="text-green-800">
              We've sent a confirmation email with all the details of your appointment. Our team will arrive at your location on the scheduled date and time.
            </p>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="mb-2"><strong>Appointment ID:</strong> #MS{Math.floor(Math.random() * 10000)}</p>
            <p className="mb-2"><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
            <p className="mb-2"><strong>Time:</strong> {selectedTime}</p>
            <div className="flex items-center justify-center mt-3 text-gray-700">
              <MapPin className="h-4 w-4 mr-1 text-[#008879]" />
              <p><strong>Location:</strong> {address}</p>
            </div>
          </div>
          
          <Button 
            onClick={onReturnHome}
            className="bg-[#008879] hover:bg-[#07776b] text-white"
          >
            Return to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceConfirmation; 
import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Clock, ArrowRight, Calendar, CheckCircle } from "lucide-react";
import AddPetModal from "./AddPetModal";

const BookingForm = ({
  // Pet selection props
  pets = [],
  petType,
  setPetType,
  refreshPets,
  
  // Scheduling props
  date,
  setDate,
  time,
  setTime,
  timeSlots = [],
  availability = {},
  formData,
  setFormData,
  reasons = [],
  
  // Step indicators
  isSchedulingStep = false,
  isConfirmationStep = false,
  
  // Submission props
  isSubmitting = false,
  onContinue,
}) => {
  // Get selected pet information for confirmation step
  const getSelectedPet = () => {
    if (!petType || !pets.length) return null;
    return pets.find(pet => pet.Pet_id.toString() === petType.toString());
  };
  
  const selectedPet = getSelectedPet();

  // Render different content based on the current step
  const renderPetSelectionStep = () => (
    <>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-xl flex items-center">
          <Clock className="mr-2 h-5 w-5 text-[#008879]" />
          Select Your Pet
        </CardTitle>
        <CardDescription>Choose which pet needs an appointment</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="petType" className="text-sm font-medium">Select Pet</Label>
            <div className="flex items-center gap-2 mt-1">
              <Select value={petType} 
                onValueChange={(value) => setPetType(value)}
                required
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.length > 0 ? (
                    pets.map((pet) => (
                      <SelectItem 
                        key={pet.Pet_id} 
                        value={pet.Pet_id.toString()}
                      >
                        {pet.Pet_name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 p-2"><p>No pets found. Please add a pet.</p></div>
                  )}
                </SelectContent>
              </Select>
              <AddPetModal 
                onPetAdded={refreshPets}
                userId={localStorage.getItem("userId")} 
              />
            </div>
            {pets.length === 0 && (
              <div className="text-sm text-gray-500 mt-2">
                You need to add a pet before booking an appointment.
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 flex justify-end">
        <Button 
          onClick={onContinue}
          disabled={!petType}
          className="bg-[#008879] hover:bg-[#07776b] text-white"
        >
          Continue
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </>
  );

  const renderSchedulingStep = () => (
    <>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-xl flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-[#008879]" />
          Schedule Your Appointment
        </CardTitle>
        <CardDescription>Choose a date, time and reason for your visit</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date" className="text-sm font-medium">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time" className="text-sm font-medium">Time</Label>
              <Select value={time} onValueChange={setTime} required>
                <SelectTrigger className="h-10 mt-1">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot, index) => {
                    const isAvailable = availability[slot.rawTime];
                    const isDisabled = isAvailable === false;
                    
                    return (
                      <SelectItem 
                        key={index} 
                        value={slot.value}
                        disabled={isDisabled}
                        className={isDisabled ? "text-red-500" : ""}
                      >
                        {slot.display} {isDisabled && "(Unavailable)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="reason" className="text-sm font-medium">Reason *</Label>
            <Select 
              value={formData.reason} 
              onValueChange={(value) => setFormData({...formData, reason: value})} 
              required
            >
              <SelectTrigger className="h-10 mt-1">
                <SelectValue placeholder="Select Reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.id} value={r.reason_name}>
                    {r.reason_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="note" className="text-sm font-medium">Additional Note (Optional)</Label>
            <Textarea
              id="note"
              value={formData.additional_note}
              onChange={(e) => setFormData({ ...formData, additional_note: e.target.value })}
              placeholder="Enter any additional notes (optional)"
              className="h-24 mt-1"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 flex justify-end">
        <Button 
          onClick={onContinue}
          disabled={!date || !time || !formData.reason}
          className="bg-[#008879] hover:bg-[#07776b] text-white"
        >
          Continue
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </>
  );

  const renderConfirmationStep = () => (
    <>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-xl flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-[#008879]" />
          Confirm Your Appointment
        </CardTitle>
        <CardDescription>Review and confirm your appointment details</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-4">Appointment Summary</h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm text-gray-500">Pet:</div>
                <div className="text-sm font-medium col-span-2">{selectedPet?.Pet_name} ({selectedPet?.Pet_type})</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm text-gray-500">Date:</div>
                <div className="text-sm font-medium col-span-2">{date}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm text-gray-500">Time:</div>
                <div className="text-sm font-medium col-span-2">{time}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm text-gray-500">Reason:</div>
                <div className="text-sm font-medium col-span-2">{formData.reason}</div>
              </div>
              
              {formData.additional_note && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-gray-500">Additional Notes:</div>
                  <div className="text-sm font-medium col-span-2">{formData.additional_note}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md text-sm text-yellow-800">
            <p>By confirming this appointment, you agree to our cancellation policy. Please arrive 10 minutes before your scheduled time.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 flex justify-end">
        <Button 
          onClick={onContinue}
          disabled={isSubmitting}
          className="bg-[#008879] hover:bg-[#07776b] text-white"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Booking...</span>
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
            </>
          ) : (
            <>
              Confirm Appointment
              <CheckCircle className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </>
  );

  return (
    <Card className="shadow-lg border-t-4 border-t-[#008879]">
      {isConfirmationStep ? renderConfirmationStep() : 
       isSchedulingStep ? renderSchedulingStep() : 
       renderPetSelectionStep()}
    </Card>
  );
};

export default BookingForm; 
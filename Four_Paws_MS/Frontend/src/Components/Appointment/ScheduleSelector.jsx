import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Calendar } from "@/Components/ui/calendar";
import { CalendarClock, ArrowRight } from "lucide-react";

const ScheduleSelector = ({ 
  selectedDate, 
  setSelectedDate, 
  selectedTime, 
  setSelectedTime, 
  timeSlots = [], 
  onContinue,
  onBack 
}) => {
  return (
    <Card className="shadow-lg border-t-4 border-t-[#008879]">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-xl flex items-center">
          <CalendarClock className="mr-2 h-5 w-5 text-[#008879]" />
          Schedule Your Appointment
        </CardTitle>
        <CardDescription>Select a convenient date and time</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block font-medium">Select Date</Label>
            <div className="border rounded-md p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => 
                  date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                  date.getDay() === 0 || // Sunday
                  date.getDay() === 6    // Saturday
                }
                className="rounded-md border"
              />
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block font-medium">Select Time</Label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className={`border rounded-md p-3 text-center cursor-pointer hover:border-[#008879] transition-all ${selectedTime === time ? 'border-[#008879] bg-green-50 font-medium' : 'border-gray-200'}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-slate-50 flex justify-between">
        <Button 
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          onClick={onContinue}
          className="bg-[#008879] hover:bg-[#07776b] text-white"
        >
          Continue
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScheduleSelector; 
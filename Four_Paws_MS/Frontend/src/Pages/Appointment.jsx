import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Badge } from "@/Components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Separator } from "@/Components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
//import { useToast } from "@/components/ui/use-toast";
//import { Toaster } from "@/components/ui/toaster"

// Mock data for existing appointments
const initialAppointments = [
  {
    id: 1,
    petName: "Max",
    petType: "dog",
    date: "2025-04-05",
    time: "10:00 AM",
    reason: "checkup",
    status: "scheduled",
    notes: "Annual wellness exam",
  },
  {
    id: 2,
    petName: "Bella",
    petType: "cat",
    date: "2025-04-03",
    time: "2:30 PM",
    reason: "vaccination",
    status: "completed",
    notes: "Rabies vaccination",
  },
  {
    id: 3,
    petName: "Charlie",
    petType: "dog",
    date: "2025-04-10",
    time: "11:30 AM",
    reason: "illness",
    status: "cancelled",
    notes: "Limping on front paw",
  },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [activeTab, setActiveTab] = useState("existing");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newAppointment, setNewAppointment] = useState(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  //const { toast } = useToast();

  // Form state
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const appointment = {
      id: appointments.length + 1,
      petName,
      petType,
      date,
      time,
      reason,
      notes,
      status: "scheduled",
    };

    setAppointments([...appointments, appointment]);
    setNewAppointment(appointment);
    setShowConfirmation(true);

    // Reset form
    setPetName("");
    setPetType("");
    setDate("");
    setTime("");
    setReason("");
    setNotes("");
  };

  const handleCancel = () => {
    setActiveTab("existing");
    setPetName("");
    setPetType("");
    setDate("");
    setTime("");
    setReason("");
    setNotes("");
  };

  const openCancelDialog = (appointment) => {
    if (appointment.status === "scheduled") {
      setAppointmentToCancel(appointment);
      setShowCancelDialog(true);
    }
  };

  const handleCancelAppointment = () => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === appointmentToCancel.id 
        ? { ...appointment, status: "cancelled" } 
        : appointment
    );
    
    setAppointments(updatedAppointments);
    setShowCancelDialog(false);
    
    toast({
      title: "Appointment Cancelled",
      description: `The appointment for ${appointmentToCancel.petName} on ${new Date(appointmentToCancel.date).toLocaleDateString()} has been cancelled.`,
      variant: "default",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
            Scheduled
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-500">
            Unknown
          </Badge>
        );
    }
  };

  const getReasonText = (reason) => {
    const reasons = {
      checkup: "Regular Check-up",
      vaccination: "Vaccination",
      illness: "Illness/Injury",
      dental: "Dental Care",
      grooming: "Grooming",
      other: "Other",
    };
    return reasons[reason] || reason;
  };

  // Generate available time slots
  const timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    const hourFormatted = hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? "PM" : "AM";
    timeSlots.push(`${hourFormatted}:00 ${period}`);
    timeSlots.push(`${hourFormatted}:30 ${period}`);
  }

  if (showConfirmation) {
    return (
      <div className="container max-w-md mx-auto px-4 py-10">
        <Card className="w-full border-0 shadow-lg overflow-hidden">
          <CardHeader className="text-center space-y-1 pt-8 bg-gradient-to-b from-green-50 to-white">
            <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-xl">Appointment Confirmed</CardTitle>
            <CardDescription>Your pet's appointment has been scheduled</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pt-6">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Pet</span>
                <span className="font-medium">
                  {newAppointment.petName} ({newAppointment.petType})
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{new Date(newAppointment.date).toLocaleDateString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{newAppointment.time}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Reason</span>
                <span className="font-medium">{getReasonText(newAppointment.reason)}</span>
              </div>
              {newAppointment.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-gray-500 block mb-1">Notes</span>
                    <span className="text-sm">{newAppointment.notes}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center py-8">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmation(false);
                setActiveTab("existing");
              }}
              className="rounded-full px-6"
            >
              View All Appointments
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <Card className="w-full border-0 shadow-lg overflow-hidden">
        <CardHeader className="px-6 pt-6 pb-3 bg-gradient-to-b from-blue-50 to-white">
          <CardTitle className="text-xl font-medium">Pet Appointments</CardTitle>
          <CardDescription>Manage your pet's healthcare schedule</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pt-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="existing">Appointments</TabsTrigger>
              <TabsTrigger value="new">New Booking</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4 mt-2">
              {appointments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-sm">No appointments found</p>
                  <Button variant="outline" className="mt-4 rounded-full" onClick={() => setActiveTab("new")}>
                    Book Your First Appointment
                  </Button>
                </div>
              ) : (
                <>
                  {appointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className={`py-4 first:pt-0 ${appointment.status === "scheduled" ? "cursor-pointer hover:bg-gray-50 -mx-4 px-4 rounded-md transition-colors" : ""}`}
                      onClick={() => openCancelDialog(appointment)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{appointment.petName}</h3>
                          <p className="text-sm text-gray-500 capitalize">{appointment.petType}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>

                      <div className="flex gap-6 mt-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Reason: </span>
                        <span>{getReasonText(appointment.reason)}</span>
                      </div>

                      {appointment.notes && (
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="text-gray-500">Notes: </span>
                          <span>{appointment.notes}</span>
                        </div>
                      )}

                      {appointment.status === "scheduled" && (
                        <div className="mt-3">
                          <p className="text-xs text-blue-500 italic">Click to manage this appointment</p>
                        </div>
                      )}

                      {appointment !== appointments[appointments.length - 1] && <Separator className="mt-4" />}
                    </div>
                  ))}

                  <div className="flex justify-center mt-6">
                    <Button onClick={() => setActiveTab("new")} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                      Book New Appointment
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="new">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="pet-name" className="text-sm">
                      Pet Name
                    </Label>
                    <Input
                      id="pet-name"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      required
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pet-type" className="text-sm">
                      Pet Type
                    </Label>
                    <Select value={petType} onValueChange={setPetType} required>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-sm">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="time" className="text-sm">
                      Time
                    </Label>
                    <Select value={time} onValueChange={setTime} required>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-sm">
                    Reason for Visit
                  </Label>
                  <Select value={reason} onValueChange={setReason} required>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkup">Regular Check-up</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="illness">Illness/Injury</SelectItem>
                      <SelectItem value="dental">Dental Care</SelectItem>
                      <SelectItem value="grooming">Grooming</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-sm">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific concerns or information"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={handleCancel} className="h-9">
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 px-4 bg-blue-600 hover:bg-blue-700">
                    Book Appointment
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cancel Appointment Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Cancel Appointment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the appointment for {appointmentToCancel?.petName}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            {appointmentToCancel && (
              <div className="space-y-3 text-sm border rounded-md p-3 bg-gray-50">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pet:</span>
                  <span>{appointmentToCancel.petName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>{new Date(appointmentToCancel.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span>{appointmentToCancel.time}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
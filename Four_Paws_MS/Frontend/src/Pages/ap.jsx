import React, { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import axios from "axios";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const uId = 201;

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ 
    reason: "", 
    additional_note: "" 
  });
  const [petType, setPetType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [availability, setAvailability] = useState({});
  const [reasons, setReasons] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [completedAppointment, setCompletedAppointment] = useState(null);

  const convertTimeFormat = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointment details
        const appointmentRes = await axios.get(`http://localhost:3001/appointments?id=${uId}`);
        setAppointment(appointmentRes.data);

        // Fetch time slots
        const slotsRes = await axios.get("http://localhost:3001/appointments/timeslots");
        const formattedSlots = slotsRes.data.map(slot => ({
          display: convertTimeFormat(slot.time_slot),
          value: slot.time_slot,
          rawTime: slot.time_slot
        }));
        setTimeSlots(formattedSlots);

        // Initialize availability
        const initialAvailability = {};
        formattedSlots.forEach(slot => {
          initialAvailability[slot.rawTime] = null;
        });
        setAvailability(initialAvailability);

        // Fetch reasons
        const reasonsRes = await axios.get("http://localhost:3001/appointments/reasons");
        setReasons(reasonsRes.data);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
        toast.error("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (date) {
      timeSlots.forEach(slot => {
        checkSlotAvailability(date, slot.rawTime);
      });
    }
  }, [date, timeSlots]);

  const checkSlotAvailability = async (date, time) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/appointments/checkdatetime?date=${date}&time=${time}`
      );
      setAvailability(prev => ({
        ...prev,
        [time]: response.data.available
      }));
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailability(prev => ({
        ...prev,
        [time]: false
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!availability[time]) {
      toast.error("Please select an available time slot");
      setIsSubmitting(false);
      return;
    }

    try {
      const appointmentData = {
        petType,
        time,
        date,
        reason: formData.reason,
        additional_note: formData.additional_note || null, // Make additional note optional
      };

      const response = await axios.post("http://localhost:3001/appointments/appointment", appointmentData);
      setCompletedAppointment(response.data);
      setSuccess(true);
      toast.success("Appointment booked successfully!");
      
      // Reset form
      setPetType("");
      setTime("");
      setDate("");
      setFormData({ reason: "", additional_note: "" });
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (success) {
      setSuccess(false);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><p>Loading appointment details...</p></div>;
  if (error) return <div className="flex justify-center items-center h-64"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="outline" 
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {success ? 'Back to Appointment' : 'Back to Appointments'}
      </Button>

      <Tabs defaultValue={success ? "completed" : "details"} className="w-full">
        <TabsList className="flex justify-space mb-4">
          {!success && (
            <>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="actions">Book New Appointment</TabsTrigger>
            </>
          )}
          {success && <TabsTrigger value="completed">Completed Appointment</TabsTrigger>}
        </TabsList>

        {!success && (
          <>
            <TabsContent value="details">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Appointment ID: {appointment?.appointment_id}</CardTitle>
                  <CardDescription>Details of the appointment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Pet ID</Label>
                        <p>{appointment?.pet_id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <p>{appointment?.status}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Reason</Label>
                      <p>{appointment?.reason}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Owner ID</Label>
                        <p>{appointment?.owner_id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Date</Label>
                        <p>{appointment?.appointment_date && new Date(appointment.appointment_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Time</Label>
                      <p>{appointment?.appointment_time && convertTimeFormat(appointment.appointment_time)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Book New Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="petType" className="text-sm">Pet name</Label>
                      <div className="flex items-center gap-2">
                        <Select value={petType} onValueChange={setPetType} required>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select Pet" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100">Dog</SelectItem>
                            <SelectItem value="cat">Cat</SelectItem>
                            <SelectItem value="bird">Cow</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon">
                          <Plus />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date" className="text-sm">Date</Label>
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
                      <div>
                        <Label htmlFor="time" className="text-sm">Time</Label>
                        <Select value={time} onValueChange={setTime} required>
                          <SelectTrigger className="h-9">
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
                      <Label htmlFor="reason" className="text-sm">Reason *</Label>
                      <Select 
                        value={formData.reason} 
                        onValueChange={(value) => setFormData({...formData, reason: value})} 
                        required
                      >
                        <SelectTrigger className="h-9">
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
                      <Label htmlFor="note" className="text-sm">Additional Note (Optional)</Label>
                      <Textarea
                        id="note"
                        value={formData.additional_note}
                        onChange={(e) => setFormData({ ...formData, additional_note: e.target.value })}
                        placeholder="Enter any additional notes (optional)"
                        className="h-24"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      variant="default"
                      disabled={!time || availability[time] === false || isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Booking..." : "Book Appointment"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        {success && completedAppointment && (
          <TabsContent value="completed">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Appointment Booked Successfully!</CardTitle>
                <CardDescription>Your appointment details are below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Appointment ID</Label>
                      <p>{completedAppointment.appointment_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <p className="text-green-600 font-medium">{completedAppointment.status}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Pet Type</Label>
                      <p>{completedAppointment.petType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Reason</Label>
                      <p>{completedAppointment.reason}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Date</Label>
                      <p>{new Date(completedAppointment.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Time</Label>
                      <p>{convertTimeFormat(completedAppointment.time)}</p>
                    </div>
                  </div>
                  {completedAppointment.additional_note && (
                    <div>
                      <Label className="text-sm font-medium">Additional Notes</Label>
                      <p>{completedAppointment.additional_note}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AppointmentDetails;
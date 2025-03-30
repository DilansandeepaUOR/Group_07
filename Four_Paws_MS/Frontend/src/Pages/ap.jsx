import React, { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import axios from "axios";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus } from "lucide-react"

const uId=201;

const AppointmentDetails = () => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ reason: "", status: "" });
  const [petType, setPetType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [availability, setAvailability] = useState({});

  const [reason, setReason] = useState("");
  const [reasons, setReasons] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/appointments?id=${uId}`)
      .then((response) => {
        setAppointment(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch appointment data");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3001/appointments/timeslots")
      .then((response) => {
        const formattedSlots = response.data.map(slot => {
          const [hours, minutes] = slot.time_slot.split(':');
          const hour12 = hours % 12 || 12;
          return {
            display: `${hour12}:${minutes} ${slot.am_pm}`,
            value: `${hours}:${minutes}`,
            rawTime: slot.time_slot
          };
        });
        setTimeSlots(formattedSlots);
        
        // Initialize availability for all slots
        const initialAvailability = {};
        formattedSlots.forEach(slot => {
          initialAvailability[slot.rawTime] = null; 
        });
        setAvailability(initialAvailability);        
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch time slots");
        setLoading(false);
      });
  }, []);

// Check availability for all time slots when date changes
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
        [time]: false // Assume unavailable if there's an error
      }));
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
  
    const appointmentData = {
      petType,
      time,
      date,
      reason: formData.reason,
      status: formData.status,
    };
  
    axios
      .post("http://localhost:3001/appointment", appointmentData)
      .then((response) => {
        alert("Appointment Updated Successfully!");
        console.log(response.data);
        setPetType("");
        setTime(""); // Reset fields after submission
      })
      .catch((error) => {
        console.error("Error updating appointment:", error);
        alert("Failed to update appointment. Please try again.");
      });
  };

  useEffect(() => {
    axios.get("http://localhost:3001/appointments/reasons")
      .then((response) => {
        setReasons(response.data);
      })
      .catch((error) => {
        console.error("Error fetching reasons:", error);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="flex justify-space mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="actions">Book New Appointment</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Appointment ID: {appointment?.appointment_id}</CardTitle>
              <CardDescription>Details of the appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li><strong>Pet ID:</strong> {appointment?.pet_id}</li>
                <li><strong>Reason:</strong> {appointment?.reason}</li>
                <li><strong>Status:</strong> {appointment?.status}</li>
                <li><strong>Owner ID:</strong> {appointment?.owner_id}</li>
                <li><strong>Date:</strong> {appointment?.appointment_date && new Date(appointment.appointment_date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> {appointment?.appointment_time}</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Get Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Label htmlFor="reason" className="text-sm">Pet name</Label>
                <div className="flex items-center gap-2">
                  <Select value={petType} onValueChange={setPetType} required>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select Pet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Cow</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon">
                    <Plus />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reason" className="text-sm">Date</Label>
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
                    <Label htmlFor="reason" className="text-sm">Time</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reason" className="text-sm">Status</Label>
                    <Select value={reason} onValueChange={setReason} required>
      <SelectTrigger className="h-9">
        <SelectValue placeholder="Select Reason" />
      </SelectTrigger>
      <SelectContent>
        {reasons.length > 0 ? (
          reasons.map((r) => (
            <SelectItem key={r.id} value={r.reason_name}>
              {r.reason_name}
            </SelectItem>
          ))
        ) : (
          <p className="p-2 text-gray-500">No reasons available</p>
        )}
      </SelectContent>
    </Select>
                  </div>
                </div>
                

                <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reason" className="text-sm">Additional Note </Label>
                          <Textarea
                            id="reason"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Enter reason for appointment"
                            required
                            className="h-24"
                          />
                        </div>

                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={!time || availability[timeSlots.find(slot => slot.value === time)?.rawTime] === false}
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentDetails;
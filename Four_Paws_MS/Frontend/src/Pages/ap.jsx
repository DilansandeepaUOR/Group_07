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

const AppointmentDetails = () => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ reason: "", status: "" });
  const [petType, setPetType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/appointments?id=201")
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
        // Format the time slots for display
        const formattedSlots = response.data.map(slot => {
          // Extract hours and minutes (remove seconds)
          const [hours, minutes] = slot.time_slot.split(':');
          // Convert to 12-hour format for display
          const hour12 = hours % 12 || 12;
          return {
            display: `${hour12}:${minutes} ${slot.am_pm}`,
            value: `${hours}:${minutes}`, // Store just the time without AM/PM
            rawTime: slot.time_slot // Store the raw time from API
          };
        });
        setTimeSlots(formattedSlots);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch time slots");
        setLoading(false);
      });
  }, []); 

  useEffect(() => {
    if (date && time) {
      // Find the selected time slot to get the raw time value
      const selectedSlot = timeSlots.find(slot => slot.value === time);
      const timeToSend = selectedSlot ? selectedSlot.rawTime : time.split(' ')[0];
      
      console.log("Fetching appointments for:", date, timeToSend);
      axios.get(`http://localhost:3001/appointments/checkdatetime?date=${date}&time=${timeToSend}`)
        .then((response) => {
          setAppointment(response.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch appointment data");
          setLoading(false);
        });
    }
  }, [date, time, timeSlots]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Appointment Updated: " + JSON.stringify(formData));
    setPetType("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddPet = (e) => {
    e.preventDefault();
    console.log("Appointment Updated:", formData);
  }

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
              <CardTitle>Appointment ID: {appointment.appointment_id}</CardTitle>
              <CardDescription>Details of the appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li><strong>Pet ID:</strong> {appointment.pet_id}</li>
                <li><strong>Reason:</strong> {appointment.reason}</li>
                <li><strong>Status:</strong> {appointment.status}</li>
                <li><strong>Owner ID:</strong> {appointment.owner_id}</li>
                <li><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> {appointment.appointment_time}</li>
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
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                        {timeSlots.map((slot, index) => (
                          <SelectItem key={index} value={slot.value}>
                            {slot.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" variant="primary" onChange={handleAddPet}>Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentDetails;
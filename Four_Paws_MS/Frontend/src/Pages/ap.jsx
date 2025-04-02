import React, { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import axios from "axios";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus } from "lucide-react";

const uId = 201;

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
  const [reasons, setReasons] = useState([]);

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
        setError("Failed to fetch data");
        setLoading(false);
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
    
    if (!availability[time]) {
      alert("Please select an available time slot");
      return;
    }

    try {
      const appointmentData = {
        petType,
        time,
        date,
        reason: formData.reason,
        status: formData.status,
      };

      await axios.post("http://localhost:3001/appointment", appointmentData);
      alert("Appointment Updated Successfully!");
      setPetType("");
      setTime("");
      setFormData({ reason: "", status: "" });
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment. Please try again.");
    }
  };

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
                <Label htmlFor="petType" className="text-sm">Pet name</Label>
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
                  <Label htmlFor="reason" className="text-sm">Reason</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})} 
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
                  <Label htmlFor="note" className="text-sm">Additional Note</Label>
                  <Textarea
                    id="note"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Enter additional notes"
                    className="h-24"
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={!time || availability[time] === false}
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
import React, { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import axios from "axios";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, ArrowLeft, Calendar, Clock, CheckCircle, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Badge } from "@/Components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/Components/ui/dialog";

const AddPetModal = ({ onPetAdded, userId }) => {
  const [open, setOpen] = useState(false);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("Dog");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("http://localhost:3001/appointments/pets", {
        Pet_name: petName,
        Pet_type: petType,
        gender,
        dob,
        user_id: userId
      });

      toast.success("Pet added successfully!");
      onPetAdded();
      setOpen(false);
      setPetName("");
      setGender("");
      setDob("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add pet. Please try again.");
      console.error("Error adding pet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-10">
          <Plus className="h-4 w-4 mr-1" /> Add Pet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Pet</DialogTitle>
          <DialogDescription>
            Register your pet to book appointments
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="petName" className="pb-2">Pet Name</Label>
            <Input
              id="petName"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="petType" className="pb-2">Pet Type</Label>
            <Select value={petType} onValueChange={setPetType}>
              <SelectTrigger>
                <SelectValue placeholder="Select pet type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dog">Dog</SelectItem>
                <SelectItem value="Cat">Cat</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="gender" className="pb-2">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dob" className="pb-2">Date of Birth</Label>
            <Input
              type="date"
              id="dob"
              value={dob}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#008879] hover:bg-[#07776b] text-white">
              {isSubmitting ? "Adding..." : "Add Pet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ 
    reason: "", 
    additional_note: "" 
  });
  const [petType, setPetType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");
  const [timeSlots, setTimeSlots] = useState([]);
  const [availability, setAvailability] = useState({});
  const [reasons, setReasons] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [completedAppointment, setCompletedAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [noAppointments, setNoAppointments] = useState(false);
  const [hasNoAppointmentsMsg, setHasNoAppointmentsMsg] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [pets, setPets] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  

  const convertTimeFormat = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/auth/user", { 
          withCredentials: true 
        });
        
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const fetchData = async () => {
        try {
          const appointmentRes = await axios.get(`http://localhost:3001/appointments?id=${user.id}`);
          
          if (appointmentRes.data && appointmentRes.data.msg === false) {
            setNoAppointments(true);
            setAppointments([]);
          } else if (appointmentRes.data && appointmentRes.data.msg === false) {
            setHasNoAppointmentsMsg(true);
            setNoAppointments(true);
            setAppointments([]);
            setActiveTab("actions");
          } else {
            setAppointments(appointmentRes.data);
          }

          const slotsRes = await axios.get("http://localhost:3001/appointments/timeslots");
          const formattedSlots = slotsRes.data.map(slot => ({
            display: convertTimeFormat(slot.time_slot),
            value: slot.time_slot,
            rawTime: slot.time_slot
          }));
          setTimeSlots(formattedSlots);

          const initialAvailability = {};
          formattedSlots.forEach(slot => {
            initialAvailability[slot.rawTime] = null;
          });
          setAvailability(initialAvailability);

          const reasonsRes = await axios.get("http://localhost:3001/appointments/reasons");
          setReasons(reasonsRes.data);

          const petsRes = await axios.get(`http://localhost:3001/appointments/pets?id=${user.id}`);
          if (petsRes.data && petsRes.data.msg === false) {
            setPets([]);
          } else {
            setPets(petsRes.data);
          }

          setLoading(false);
        } catch (err) {
          setError("Failed to fetch data. Please try again later.");
          setLoading(false);
          toast.error("Failed to fetch data. Please try again later.");
        }
      };

      fetchData();
    }
  }, [isAuthenticated, user?.id]);

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
    
    if (!isAuthenticated || !user?.id) {
      toast.error("Please log in to book an appointment");
      return;
    }
    
    if (!petType) {
      toast.error("Please select a pet");
      return;
    }
    
    setIsSubmitting(true);
    
    if (!availability[time]) {
      toast.error("Please select an available time slot");
      setIsSubmitting(false);
      return;
    }

    try {
      const selectedPet = pets.find(pet => pet.Pet_id.toString() === petType);
      
      const appointmentData = {
        pet_id: petType,
        petType: selectedPet?.Pet_type || '',
        time,
        date,
        reason: formData.reason,
        user_id: user.id,
        additional_note: formData.additional_note || null,
      };

      const response = await axios.post("http://localhost:3001/appointments/appointment", appointmentData);
      setCompletedAppointment(response.data);
      setSuccess(true);
      setActiveTab("completed");
      toast.success("Appointment booked successfully!");
      
      setPetType("");
      setTime("");
      setDate("");
      setFormData({ reason: "", additional_note: "" });
      setHasNoAppointmentsMsg(false);
      setNoAppointments(false);
      
      try {
        const appointmentRes = await axios.get(`http://localhost:3001/appointments?id=${user.id}`);
        if (appointmentRes.data && !appointmentRes.data.msg) {
          setAppointments(appointmentRes.data);
        }
      } catch (refreshError) {
        console.error("Error refreshing appointments:", refreshError);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (selectedAppointment || success) {
      setSelectedAppointment(null);
      setSuccess(false);
      setActiveTab("appointments");
    } else {
      navigate(-1);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      setIsCancelling(true);
      setCancellingAppointmentId(appointmentId);
      
      await axios.put(`http://localhost:3001/appointments/cancel/${appointmentId}`);
      
      setAppointments(prev => 
        prev.map(app => 
          app.appointment_id === appointmentId 
            ? {...app, status: "Cancelled"} 
            : app
        )
      );
      
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.response?.data?.error || "Failed to cancel appointment. Please try again.");
    } finally {
      setIsCancelling(false);
      setCancellingAppointmentId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFilteredAppointments = () => {
    if (statusFilter === "all") {
      return appointments;
    }
    return appointments.filter(app => app.status === statusFilter);
  };

  useEffect(() => {
    if (noAppointments && !loading && isAuthenticated) {
      setActiveTab("actions");
    }
  }, [noAppointments, loading, isAuthenticated]);

  const handleRedirectToLogin = () => {
    navigate("/login");
  };

  const refreshPets = async () => {
    try {
      const petsRes = await axios.get(`http://localhost:3001/appointments/pets?id=${user.id}`);
      if (petsRes.data && petsRes.data.msg === false) {
        setPets([]);
      } else {
        setPets(petsRes.data);
      }
    } catch (error) {
      console.error("Error refreshing pets:", error);
      toast.error("Failed to refresh pets list");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-slate-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to manage appointments</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-6">Please log in to view and book appointments for your pets</p>
            <Button 
              onClick={handleRedirectToLogin}
              className="bg-[#008879] hover:bg-[#07776b] text-white"
            >
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-red-500 font-medium">{error}</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Button 
        variant="outline" 
        onClick={handleBack}
        className="mb-6 hover:bg-slate-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {selectedAppointment || success ? 'Back to Appointments' : 'Back to Dashboard'}
      </Button>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="appointments">
            All Appointments
          </TabsTrigger>
          <TabsTrigger value="actions">
            Book New Appointment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          {hasNoAppointmentsMsg ? (
            <Card className="shadow-lg mb-6">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-xl">My Appointments</CardTitle>
                <CardDescription>View and manage your pet appointments</CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <Button 
                  onClick={() => setActiveTab("actions")}
                  className="flex items-center mx-auto"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Book New Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg mb-6">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    My Appointments
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>View and manage your pet appointments</CardDescription>
              </CardHeader>
             <CardContent className="p-4">
              {noAppointments ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-gray-500 text-sm">No appointments found</p>
                </div>
              ) : getFilteredAppointments().length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500 text-sm">No appointments found with the selected filter</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredAppointments().map((appointment) => (
                    <div
                      key={appointment.appointment_id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-semibold text-gray-800">
                          #{appointment.appointment_id} - {appointment.Pet_name || appointment.petType}
                        </div>
                        <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 text-sm text-gray-600 gap-2 mb-2">
                        <div>
                          <span className="block text-gray-400">Date</span>
                          {formatDate(appointment.appointment_date)}
                        </div>
                        <div>
                          <span className="block text-gray-400">Time</span>
                          {convertTimeFormat(appointment.appointment_time)}
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="block text-gray-400">Reason</span>
                          {appointment.reason}
                        </div>
                        {appointment.additional_note && (
                          <div className="col-span-2">
                            <span className="block text-gray-400">Note</span>
                            {appointment.additional_note}
                          </div>
                        )}
                      </div>

                      {appointment.status === "Scheduled" && (
                        <div className="flex justify-end mt-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="xs"
                                variant="outline"
                                className="text-red-600 border-red-300 bg-red-50 hover:bg-red-100 hover:text-red-700"
                              >
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this appointment? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Go Back</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelAppointment(appointment.appointment_id)}
                                  disabled={
                                    isCancelling && cancellingAppointmentId === appointment.appointment_id
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  {isCancelling && cancellingAppointmentId === appointment.appointment_id
                                    ? "Cancelling..."
                                    : "Yes, Cancel"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>


              <CardFooter className="bg-slate-50 border-t p-4">
                <Button 
                  onClick={() => setActiveTab("actions")}
                  className="flex items-center ml-auto bg-[#008879] hover:bg-[#07776b] text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Appointment
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions">
          <Card className="shadow-lg border-t-4 border-t-indigo-500">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xl flex items-center">
                <Clock className="mr-2 h-5 w-5 text-indigo-500" />
                Book New Appointment
              </CardTitle>
              <CardDescription>Schedule your pet's visit</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="petType" className="text-sm font-medium">Pet</Label>
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
                                value={pet.Pet_id.toString()} // Ensure string type
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
                      userId={user.id} 
                    />
                  </div>
                  {pets.length === 0 && (
                    <div className="text-sm text-gray-500 mt-2">
                      You need to add a pet before booking an appointment.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
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

                <Button 
                  type="submit" 
                  variant="default"
                  disabled={!time || availability[time] === false || isSubmitting || !petType}
                  className="w-full h-10 bg-[#008879] hover:bg-[#07776b] text-white"
                >
                  {isSubmitting ? "Booking..." : "Book Appointment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {success && (
          <TabsContent value="completed">
            {completedAppointment && (
              <Card className="shadow-lg border-t-4 border-t-green-500">
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-12 w-12 text-green-500" />
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
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Appointment ID</Label>
                        <p className="font-medium">{completedAppointment.appointment_id}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                        <p className="font-medium">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {completedAppointment.status || "Confirmed"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Pet</Label>
                        <p className="font-medium">{completedAppointment.pet_name || completedAppointment.petType}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Reason</Label>
                        <p className="font-medium">{completedAppointment.reason}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Date</Label>
                        <p className="font-medium">{new Date(completedAppointment.date).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Time</Label>
                        <p className="font-medium">{convertTimeFormat(completedAppointment.time)}</p>
                      </div>
                    </div>
                    {completedAppointment.additional_note && (
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Additional Notes</Label>
                        <p className="font-medium">{completedAppointment.additional_note}</p>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab("appointments")}
                    >
                      Return to Appointments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AppointmentDetails;
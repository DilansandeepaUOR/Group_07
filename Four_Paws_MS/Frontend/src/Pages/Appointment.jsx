import React, { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

// Import reusable components
import AppointmentList from "@/Components/Appointment/AppointmentList";
import BookingForm from "@/Components/Appointment/BookingForm";
import BookingConfirmation from "@/Components/Appointment/BookingConfirmation";
import AuthRequiredCard from "@/Components/Appointment/AuthRequiredCard";
import StepIndicator from "@/Components/Appointment/StepIndicator";

// Import utilities
import { convertTimeFormat, formatDate, getStatusColor } from "@/Components/Appointment/utils";

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ 
    reason: "", 
    additional_note: "" 
  });
  const [petType, setPetType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [activeStep, setActiveStep] = useState("appointments");
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

  // Steps for the appointment booking process
  const steps = ["pet-selection", "scheduling", "confirmation", "completed"];
  const stepLabels = ["Pet Selection", "Scheduling", "Review & Submit", "Completed"];

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
          setLoading(true);
          const appointmentRes = await axios.get(`http://localhost:3001/appointments?id=${user.id}`);
          
          if (appointmentRes.data && appointmentRes.data.msg === false) {
            setNoAppointments(true);
            setAppointments([]);
          } else if (appointmentRes.data && appointmentRes.data.msg === false) {
            setHasNoAppointmentsMsg(true);
            setNoAppointments(true);
            setAppointments([]);
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
        } catch (err) {
          setError("Failed to fetch data. Please try again later.");
          toast.error("Failed to fetch data. Please try again later.");
        } finally {
          setLoading(false);
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

  const handleContinue = () => {
    if (activeStep === "pet-selection") {
      if (!petType) {
        toast.error("Please select a pet");
        return;
      }
      setActiveStep("scheduling");
    } 
    else if (activeStep === "scheduling") {
      if (!date) {
        toast.error("Please select a date");
        return;
      }
      if (!time) {
        toast.error("Please select a time slot");
        return;
      }
      if (!formData.reason) {
        toast.error("Please select a reason for your visit");
        return;
      }
      setActiveStep("confirmation");
    }
    else if (activeStep === "confirmation") {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
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
      setActiveStep("completed");
      toast.success("Appointment booked successfully!");
      
      // Reset form data
      setPetType("");
      setTime("");
      setDate("");
      setFormData({ reason: "", additional_note: "" });
      setHasNoAppointmentsMsg(false);
      setNoAppointments(false);
      
      // Refresh appointments list
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
    if (activeStep === "scheduling") {
      setActiveStep("pet-selection");
    }
    else if (activeStep === "confirmation") {
      setActiveStep("scheduling");
    }
    else if (activeStep === "completed") {
      setSuccess(false);
      setActiveStep("appointments");
    }
    else {
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

  const handleRedirectToLogin = () => {
    navigate("/login");
  };

  const refreshPets = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      setLoading(true);
      const petsRes = await axios.get(`http://localhost:3001/appointments/pets?id=${user.id}`);
      if (petsRes.data && petsRes.data.msg === false) {
        setPets([]);
      } else {
        setPets(petsRes.data);
      }
    } catch (error) {
      console.error("Error refreshing pets:", error);
      toast.error("Failed to refresh pets list");
    } finally {
      setLoading(false);
    }
  };

  const startBooking = () => {
    setActiveStep("pet-selection");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F]">
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#A6E3E9] mb-4">Clinic Appointments</h1>
            <p className="text-lg text-gray-200">Schedule a visit to our clinic for your pet's care</p>
        </div>

        {loading ? (
          <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A6E3E9] mx-auto"></div>
              <p className="mt-4 text-gray-200">Loading...</p>
          </div>
        ) : !isAuthenticated ? (
          <AuthRequiredCard onLogin={handleRedirectToLogin} />
        ) : (
          <>
            {activeStep === "appointments" && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <Button 
                    onClick={startBooking}
                      className="bg-[#A6E3E9] hover:bg-[#71C9CE] text-[#22292F] font-bold transition duration-300"
                  >
                    Book New Appointment
                  </Button>
                </div>
                
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <AppointmentList 
                  appointments={appointments}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  noAppointments={noAppointments}
                  handleCancelAppointment={handleCancelAppointment}
                  cancellingAppointmentId={cancellingAppointmentId}
                  isCancelling={isCancelling}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
                  </div>
              </div>
            )}
            
            {activeStep !== "appointments" && (
              <>
                <div className="mb-4">
                    <Button 
                      variant="ghost" 
                      className="text-gray-200 hover:text-[#A6E3E9] hover:bg-white/10" 
                      onClick={handleBack}
                    >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                </div>
                
                  <div className="sticky top-4 z-50 bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 shadow-lg">
                    <StepIndicator 
                      steps={steps}
                      stepLabels={stepLabels}
                      activeStep={activeStep}
                    />
                  </div>
              </>
            )}
            
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            {activeStep === "pet-selection" && (
              <BookingForm
                pets={pets}
                petType={petType}
                setPetType={setPetType}
                refreshPets={refreshPets}
                onContinue={handleContinue}
              />
            )}
            
            {activeStep === "scheduling" && (
              <BookingForm
                date={date}
                setDate={setDate}
                time={time}
                setTime={setTime}
                formData={formData}
                setFormData={setFormData}
                reasons={reasons}
                timeSlots={timeSlots}
                availability={availability}
                isSchedulingStep={true}
                onContinue={handleContinue}
              />
            )}
            
            {activeStep === "confirmation" && (
              <BookingForm
                petType={petType}
                date={date}
                time={time}
                formData={formData}
                pets={pets}
                isConfirmationStep={true}
                isSubmitting={isSubmitting}
                onContinue={handleContinue}
              />
            )}
            
            {activeStep === "completed" && success && (
              <BookingConfirmation
                appointment={completedAppointment}
                onBack={handleBack}
              />
            )}
              </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
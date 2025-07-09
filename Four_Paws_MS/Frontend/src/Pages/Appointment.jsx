import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  User, 
  PawPrint, 
  MapPin, 
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight
} from "lucide-react";

// Import reusable components
import AuthRequiredCard from "@/Components/Appointment/AuthRequiredCard";
import AddPetModal from "@/Components/Appointment/AddPetModal";

// Import utilities
import { convertTimeFormat, formatDate, getStatusColor } from "@/Components/Appointment/utils";

const AppointmentDetails = () => {
  const navigate = useNavigate();
  
  // Auth states
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({ 
    pet_id: "",
    service_type: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    reason: "", 
    additional_notes: ""
  });
  
  // Data states
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availability, setAvailability] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedAppointment, setCompletedAppointment] = useState(null);

  // Steps configuration
  const steps = [
    { id: 1, title: "Select Pet & Service", icon: PawPrint },
    { id: 2, title: "Choose Date & Time", icon: Calendar },
    { id: 3, title: "Review & Confirm", icon: CheckCircle }
  ];

  // Check authentication
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
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchInitialData();
    }
  }, [isAuthenticated, user?.id]);

  const fetchInitialData = async () => {
        try {
          setLoading(true);
      
      // Fetch pets, services, and time slots in parallel
      const [petsRes, servicesRes, slotsRes] = await Promise.all([
        axios.get(`http://localhost:3001/appointments/pets?id=${user.id}`),
        axios.get("http://localhost:3001/appointments/reasons"),
        axios.get("http://localhost:3001/appointments/timeslots")
      ]);

      // Process pets data
      if (petsRes.data && petsRes.data.msg === false) {
        setPets([]);
          } else {
        setPets(petsRes.data || []);
          }

      // Process services data
      setServices(servicesRes.data || []);

      // Process time slots
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

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load appointment data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

  // Check availability when date changes or when time slots are loaded
  useEffect(() => {
    if (formData.date && timeSlots.length > 0) {
      checkAvailability(formData.date);
    }
  }, [formData.date, timeSlots]);

  // Check availability for today when component mounts
  useEffect(() => {
    if (timeSlots.length > 0 && formData.date) {
      checkAvailability(formData.date);
    }
  }, [timeSlots]);

  const checkAvailability = async (date) => {
    try {
      const promises = timeSlots.map(slot => 
        axios.get(`http://localhost:3001/appointments/checkdatetime?date=${date}&time=${slot.rawTime}`)
      );
      
      const responses = await Promise.all(promises);
      const newAvailability = {};
      
      timeSlots.forEach((slot, index) => {
        newAvailability[slot.rawTime] = responses[index].data.available;
      });
      
      setAvailability(newAvailability);
    } catch (error) {
      console.error("Error checking availability:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep === 1) {
      if (!formData.pet_id) {
        toast.error("Please select a pet");
        return;
      }
      if (!formData.service_type) {
        toast.error("Please select a service");
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!formData.date) {
        toast.error("Please select a date");
        return;
      }
      if (!formData.time) {
        toast.error("Please select a time");
        return;
      }
      setActiveStep(3);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    } else {
      navigate("/appointmentlanding");
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please log in to book an appointment");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const selectedPet = pets.find(pet => pet.Pet_id.toString() === formData.pet_id);
      const selectedService = services.find(service => service.id.toString() === formData.service_type);
      
      const appointmentData = {
        pet_id: formData.pet_id,
        petType: selectedPet?.Pet_type || '',
        time: formData.time,
        date: formData.date,
        reason: selectedService?.reason_name || formData.service_type,
        user_id: user.id,
        additional_note: formData.additional_notes || null,
      };

      const response = await axios.post("http://localhost:3001/appointments/appointment", appointmentData);
      setCompletedAppointment(response.data);
      setActiveStep(4); // Success step
      toast.success("Appointment booked successfully!");
      
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(error.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshPets = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      const petsRes = await axios.get(`http://localhost:3001/appointments/pets?id=${user.id}`);
      if (petsRes.data && petsRes.data.msg === false) {
        setPets([]);
      } else {
        setPets(petsRes.data || []);
      }
    } catch (error) {
      console.error("Error refreshing pets:", error);
      toast.error("Failed to refresh pets list");
    }
  };

  const handleRedirectToLogin = () => {
    navigate("/login");
  };

  const getSelectedPet = () => pets.find(pet => pet.Pet_id.toString() === formData.pet_id);
  const getSelectedService = () => services.find(service => service.id.toString() === formData.service_type);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#A6E3E9] mx-auto mb-4" />
          <p className="text-gray-200">Loading appointment data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F] flex items-center justify-center p-4">
        <AuthRequiredCard onLogin={handleRedirectToLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-200 hover:text-[#A6E3E9] transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </button>
            <h1 className="text-2xl font-semibold text-[#A6E3E9]">Book Clinic Appointment</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isCompleted 
                      ? 'bg-[#A6E3E9] border-[#A6E3E9] text-[#22292F]' 
                      : isActive 
                        ? 'bg-[#A6E3E9] border-[#A6E3E9] text-[#22292F]' 
                        : 'bg-white/10 border-white/20 text-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-[#A6E3E9]' : isCompleted ? 'text-[#A6E3E9]' : 'text-gray-300'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-[#A6E3E9]' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
          {/* Step 1: Select Pet & Service */}
          {activeStep === 1 && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#A6E3E9] mb-2">Select Your Pet & Service</h2>
                <p className="text-gray-200">Choose your pet and the service you need</p>
              </div>

              <div className="space-y-6">
                {/* Pet Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#A6E3E9] mb-3">Select Pet</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pets.map(pet => (
                      <div
                        key={pet.Pet_id}
                        onClick={() => handleInputChange('pet_id', pet.Pet_id.toString())}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.pet_id === pet.Pet_id.toString()
                            ? 'border-[#A6E3E9] bg-[#A6E3E9]/10'
                            : 'border-white/20 hover:border-[#A6E3E9]/50 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#A6E3E9]/20 rounded-full flex items-center justify-center mr-3">
                            <PawPrint className="h-5 w-5 text-[#A6E3E9]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#A6E3E9]">{pet.Pet_name}</p>
                            <p className="text-sm text-gray-300">{pet.Pet_type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <AddPetModal onPetAdded={refreshPets} userId={user.id} />
                  </div>
                </div>
                
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#A6E3E9] mb-3">Select Service</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(service => (
                      <div
                        key={service.id}
                        onClick={() => handleInputChange('service_type', service.id.toString())}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.service_type === service.id.toString()
                            ? 'border-[#A6E3E9] bg-[#A6E3E9]/10'
                            : 'border-white/20 hover:border-[#A6E3E9]/50 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#71C9CE]/20 rounded-full flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-[#71C9CE]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#A6E3E9]">{service.reason_name}</p>
                            <p className="text-sm text-gray-300">Veterinary service</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                  </div>
              </div>
            )}
            
          {/* Step 2: Choose Date & Time */}
          {activeStep === 2 && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#A6E3E9] mb-2">Choose Date & Time</h2>
                <p className="text-gray-200">Select a convenient date and time for your appointment</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#A6E3E9] mb-3">Select Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-white/20 rounded-lg bg-white/10 text-gray-200 focus:ring-2 focus:ring-[#A6E3E9] focus:border-transparent"
                  />
                </div>
                
                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#A6E3E9] mb-3">Select Time</label>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {timeSlots.map(slot => {
                      const isAvailable = availability[slot.rawTime];
                      const isSelected = formData.time === slot.rawTime;
                      
                      return (
                        <button
                          key={slot.rawTime}
                          onClick={() => handleInputChange('time', slot.rawTime)}
                          disabled={!isAvailable}
                          className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-[#A6E3E9] bg-[#A6E3E9]/10 text-[#A6E3E9]'
                              : isAvailable
                                ? 'border-white/20 hover:border-[#A6E3E9]/50 text-gray-200 bg-white/5'
                                : 'border-white/10 bg-white/5 text-red-300 cursor-not-allowed'
                          }`}
                        >
                          {slot.display}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-[#A6E3E9] mb-3">Additional Notes (Optional)</label>
                <textarea
                  value={formData.additional_notes}
                  onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                  rows={3}
                  placeholder="Any special concerns or information about your pet..."
                  className="w-full p-3 border border-white/20 rounded-lg bg-white/10 text-gray-200 focus:ring-2 focus:ring-[#A6E3E9] focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {activeStep === 3 && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#A6E3E9] mb-2">Review Your Appointment</h2>
                <p className="text-gray-200">Please review your appointment details before confirming</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-[#A6E3E9] mb-4">Appointment Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-300 mr-3" />
                        <span className="text-gray-200">{formatDate(formData.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-300 mr-3" />
                        <span className="text-gray-200">{convertTimeFormat(formData.time)}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-300 mr-3" />
                        <span className="text-gray-200">{getSelectedService()?.reason_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-[#A6E3E9] mb-4">Pet Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <PawPrint className="h-4 w-4 text-gray-300 mr-3" />
                        <span className="text-gray-200">{getSelectedPet()?.Pet_name}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-300 mr-3" />
                        <span className="text-gray-200">Clinic Visit</span>
                      </div>
                    </div>
                  </div>
                </div>

                {formData.additional_notes && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="font-medium text-[#A6E3E9] mb-2">Additional Notes</h3>
                    <p className="text-gray-200">{formData.additional_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Step */}
          {activeStep === 4 && completedAppointment && (
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#A6E3E9]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-[#A6E3E9]" />
                </div>
                <h2 className="text-xl font-semibold text-[#A6E3E9] mb-2">Appointment Confirmed!</h2>
                <p className="text-gray-200">Your appointment has been successfully booked</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 mb-6 text-left border border-white/10">
                <h3 className="font-medium text-[#A6E3E9] mb-4">Appointment Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-[#A6E3E9]">Appointment ID:</span> <span className="text-gray-200">#{completedAppointment.appointment_id}</span></p>
                  <p><span className="font-medium text-[#A6E3E9]">Date:</span> <span className="text-gray-200">{formatDate(completedAppointment.date)}</span></p>
                  <p><span className="font-medium text-[#A6E3E9]">Time:</span> <span className="text-gray-200">{convertTimeFormat(completedAppointment.time)}</span></p>
                  <p><span className="font-medium text-[#A6E3E9]">Service:</span> <span className="text-gray-200">{completedAppointment.reason}</span></p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/appointmentlanding")}
                  className="px-6 py-3 bg-[#A6E3E9] text-[#22292F] rounded-lg font-medium hover:bg-[#71C9CE] transition-colors"
                >
                  View My Appointments
                </button>
                <button
                  onClick={() => {
                    setActiveStep(1);
                    setFormData({
                      pet_id: "",
                      service_type: "",
                      date: "",
                      time: "",
                      reason: "",
                      additional_notes: ""
                    });
                    setCompletedAppointment(null);
                  }}
                  className="px-6 py-3 border border-white/20 text-gray-200 rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Book Another Appointment
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {activeStep < 4 && (
            <div className="px-8 py-6 bg-white/5 border-t border-white/10 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 text-gray-200 hover:text-[#A6E3E9] transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={activeStep === 3 ? handleSubmit : handleNext}
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#A6E3E9] text-[#22292F] rounded-lg font-medium hover:bg-[#71C9CE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : activeStep === 3 ? (
                  'Confirm Appointment'
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
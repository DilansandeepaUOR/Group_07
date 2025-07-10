import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, PawPrint, User, MapPin, CheckCircle, Loader2, ArrowRight, Home, Map, AlertCircle } from "lucide-react";
import AuthRequiredCard from "@/Components/Appointment/AuthRequiredCard";
import AddPetModal from "@/Components/Appointment/AddPetModal";
import MapComponent from "@/Components/Appointment/MapComponent";

// Add shake animation style
const MobileServiceMain = () => {
  const navigate = useNavigate();

  // Auth states
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [userPets, setUserPets] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);

  // Form states
  const [activeStep, setActiveStep] = useState(1);
  const [petId, setPetId] = useState("");
  const [petDetails, setPetDetails] = useState({ pet_id: "", pet_name: "", special_notes: "", pet_type: "" });
  const [selectedService, setSelectedService] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapSelectMode, setMapSelectMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedAppointment, setCompletedAppointment] = useState(null);
  const [additionalNote, setAdditionalNote] = useState("");

  // Add error states
  const [petError, setPetError] = useState(false);
  const [serviceError, setServiceError] = useState(false);

  // Steps configuration
  const steps = [
    { id: 1, title: "Pet & Service", icon: PawPrint },
    { id: 2, title: "Location", icon: MapPin },
    { id: 3, title: "Review & Confirm", icon: CheckCircle }
  ];

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/auth/user", { withCredentials: true });
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch pets, services, and address
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchInitialData();
    }
  }, [isAuthenticated, user?.id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [petsRes, servicesRes, addressRes] = await Promise.all([
        axios.get(`http://localhost:3001/api/pets?id=${user.id}`),
        axios.get("http://localhost:3001/appointments/reasons"),
        axios.get(`http://localhost:3001/api/mobileservice/address?id=${user.id}`)
      ]);
      setUserPets(petsRes.data || []);
      setServiceOptions(servicesRes.data || []);
      if (addressRes.data?.length > 0) setUserAddress(addressRes.data[0].Owner_address);
    } catch (err) {
      toast.error("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Location handlers
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          setUseCurrentLocation(true);
          setMapSelectMode(false);
          setLoading(false);
          toast.success("Location detected");
        },
        () => {
          toast.error("Unable to get location. Please select from map or enter your address.");
          setUseCurrentLocation(false);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  // Step navigation
  const handleNext = () => {
    if (activeStep === 1) {
      let hasError = false;
      if (!petId) {
        setPetError(true);
        toast.error("Please select a pet");
        hasError = true;
      } else {
        setPetError(false);
      }
      if (!selectedService) {
        setServiceError(true);
        toast.error("Please select a service");
        hasError = true;
      } else {
        setServiceError(false);
      }
      if (hasError) return;
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!useCurrentLocation && !userAddress) return toast.error("Please select a location option");
      setActiveStep(3);
    }
  };
  const handleBack = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
    else navigate("/appointmentlanding");
  };

  // Submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const locationData = useCurrentLocation && currentLocation
        ? { type: "coordinates", latitude: currentLocation.latitude, longitude: currentLocation.longitude }
        : { type: "address", value: userAddress };
      const selectedServiceObj = serviceOptions.find(s => s.id.toString() === selectedService);
      const isOtherService = selectedServiceObj && selectedServiceObj.reason_name === "Other";
      const reason = isOtherService ? additionalNote : (selectedServiceObj ? selectedServiceObj.reason_name : "");
      const appointmentData = {
        user_id: user.id,
        pet_id: petId,
        service_id: selectedService,
        location: locationData,
        status: "pending",
        reason
      };
      await axios.post("http://localhost:3001/api/mobileservice", appointmentData);
      setCompletedAppointment(appointmentData);
      setActiveStep(4);
      toast.success("Mobile appointment booked successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading/auth states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#A6E3E9] mx-auto mb-4" />
          <p className="text-gray-200">Loading mobile service data...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F] flex items-center justify-center p-4">
        <AuthRequiredCard onLogin={() => navigate("/login")} />
      </div>
    );
  }

  const selectedServiceObj = serviceOptions.find(s => s.id.toString() === selectedService);
  const isOtherService = selectedServiceObj && selectedServiceObj.reason_name === "Other";
  const reason = isOtherService ? additionalNote : (selectedServiceObj ? selectedServiceObj.reason_name : "");

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
            <h1 className="text-2xl font-semibold text-[#A6E3E9]">Book Mobile Service</h1>
            <div className="w-20"></div>
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
                  <div className="mt-2 sm:mt-0 sm:ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-[#A6E3E9]' : isCompleted ? 'text-[#A6E3E9]' : 'text-gray-300'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                      <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
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
          {/* Step 1: Pet & Service */}
          {activeStep === 1 && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#A6E3E9] mb-2">Select Your Pet & Service</h2>
                <p className="text-gray-200">Choose your pet and the service you need</p>
              </div>
              <div className="space-y-6">
                {/* Pet Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${petError ? 'text-red-500' : 'text-[#A6E3E9]'}`}>Select Pet</label>
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${petError ? 'border border-red-500 rounded-lg p-2 shake' : ''}`}>
                    {userPets.map(pet => (
                      <div
                        key={pet.Pet_id}
                        onClick={() => { setPetId(pet.Pet_id.toString()); setPetError(false); }}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          petId === pet.Pet_id.toString()
                            ? 'border-[#A6E3E9] bg-[#A6E3E9]/10'
                            : 'border-white/20 hover:border-[#A6E3E9]/50 bg-white/5'
                        } ${petError && !petId ? 'border-red-500' : ''}`}
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
                  {petError && !petId && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="inline h-4 w-4 mr-1" /> Please select a pet</p>
                  )}
                  <div className="mt-4">
                    <AddPetModal onPetAdded={fetchInitialData} userId={user.id} />
                  </div>
                </div>
                {/* Service Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${serviceError ? 'text-red-500' : 'text-[#A6E3E9]'}`}>Select Service</label>
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${serviceError ? 'border border-red-500 rounded-lg p-2 shake' : ''}`}>
                    {serviceOptions.map(service => (
                      <div
                        key={service.id}
                        onClick={() => { setSelectedService(service.id.toString()); setServiceError(false); }}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedService === service.id.toString()
                            ? 'border-[#A6E3E9] bg-[#A6E3E9]/10'
                            : 'border-white/20 hover:border-[#A6E3E9]/50 bg-white/5'
                        } ${serviceError && !selectedService ? 'border-red-500' : ''}`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#71C9CE]/20 rounded-full flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-[#71C9CE]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#A6E3E9]">{service.reason_name}</p>
                            <p className="text-sm text-gray-300">Mobile service</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {serviceError && !selectedService && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="inline h-4 w-4 mr-1" /> Please select a service</p>
                  )}
                  {isOtherService && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-[#A6E3E9] mb-1">
                        Please specify your service request
                      </label>
                      <textarea
                        className="w-full p-2 border border-white/10 rounded-md bg-white/10 text-gray-200 focus:ring-2 focus:ring-[#A6E3E9] focus:border-transparent"
                        rows={3}
                        value={additionalNote}
                        onChange={e => setAdditionalNote(e.target.value)}
                        placeholder="Describe your service needs..."
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {activeStep === 2 && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#A6E3E9] mb-2">Choose Service Location</h2>
                <p className="text-gray-200">Select where you'd like us to provide the service</p>
              </div>
              <div className="space-y-6">
                {/* Location Options */}
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={useCurrentLocation && !mapSelectMode}
                      onChange={() => { setUseCurrentLocation(true); setMapSelectMode(false); getCurrentLocation(); }}
                      className="accent-[#A6E3E9]"
                    />
                    <span className="text-gray-200">Use my GPS location</span>
                    <button
                      onClick={getCurrentLocation}
                      className="ml-2 px-3 py-1 bg-[#A6E3E9] text-[#22292F] text-sm rounded hover:bg-[#71C9CE] font-bold transition duration-300"
                      disabled={loading}
                    >
                      {loading ? "Detecting..." : "Detect GPS"}
                    </button>
                  </label>
                  {currentLocation && useCurrentLocation && !mapSelectMode && (
                    <div className="ml-7 text-sm text-gray-200 bg-white/10 p-3 rounded-md border border-white/10">
                      <p className="font-medium mb-1 text-[#A6E3E9]">GPS Location</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#A6E3E9]/20 text-[#A6E3E9] px-2 py-1 rounded text-xs">
                          Lat: {currentLocation.latitude?.toFixed(6)}
                        </span>
                        <span className="bg-[#A6E3E9]/20 text-[#A6E3E9] px-2 py-1 rounded text-xs">
                          Lng: {currentLocation.longitude?.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={mapSelectMode}
                      onChange={() => { setUseCurrentLocation(false); setMapSelectMode(true); }}
                      className="accent-[#A6E3E9]"
                    />
                    <span className="text-gray-200">Select from Map</span>
                  </label>
                  {mapSelectMode && (
                    <div className="mt-4 space-y-4">
                      <div className="border border-white/10 rounded-md overflow-hidden" style={{ height: '300px' }}>
                        <MapComponent
                          position={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : null}
                          onPositionChange={(latlng) => {
                            setCurrentLocation({ latitude: latlng.lat, longitude: latlng.lng });
                            setUseCurrentLocation(true);
                          }}
                          height="100%"
                        />
                      </div>
                      <div className="text-xs text-gray-300 italic">Click anywhere on the map to select a location</div>
                    </div>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={!useCurrentLocation && !mapSelectMode}
                      onChange={() => { setUseCurrentLocation(false); setMapSelectMode(false); }}
                      className="accent-[#A6E3E9]"
                    />
                    <span className="text-gray-200">Use my address</span>
                  </label>
                  {!useCurrentLocation && !mapSelectMode && (
                    <div className="ml-7">
                      <textarea
                        className="w-full p-2 border border-white/10 rounded-md bg-white/10 text-gray-200 focus:ring-2 focus:ring-[#A6E3E9] focus:border-transparent"
                        rows="3"
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                        placeholder="Enter your address"
                      />
                    </div>
                  )}
                </div>
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
                    <h3 className="font-medium text-[#A6E3E9] mb-4">Service Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-300 mr-3" />
                        <span className="text-gray-200">{serviceOptions.find(s => s.id.toString() === selectedService)?.reason_name}</span>
                      </div>
                      <div className="flex items-center">
                        <PawPrint className="h-4 w-4 text-gray-300 mr-3" />
                        <span className="text-gray-200">{userPets.find(p => p.Pet_id.toString() === petId)?.Pet_name}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#A6E3E9] mb-4">Location</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-300 mr-3" />
                        <span className="text-gray-200">
                          {useCurrentLocation && currentLocation
                            ? `GPS: ${currentLocation.latitude?.toFixed(6)}, ${currentLocation.longitude?.toFixed(6)}`
                            : userAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
                <h2 className="text-xl font-semibold text-[#A6E3E9] mb-2">Mobile Service Requested!</h2>
                <p className="text-gray-200">Your mobile service request has been submitted</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 mb-6 text-left border border-white/10">
                <h3 className="font-medium text-[#A6E3E9] mb-4">Appointment Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-[#A6E3E9]">Service:</span> <span className="text-gray-200">{serviceOptions.find(s => s.id.toString() === selectedService)?.reason_name}</span></p>
                  <p><span className="font-medium text-[#A6E3E9]">Pet:</span> <span className="text-gray-200">{userPets.find(p => p.Pet_id.toString() === petId)?.Pet_name}</span></p>
                  <p><span className="font-medium text-[#A6E3E9]">Location:</span> <span className="text-gray-200">{useCurrentLocation && currentLocation ? `GPS: ${currentLocation.latitude?.toFixed(6)}, ${currentLocation.longitude?.toFixed(6)}` : userAddress}</span></p>
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
                    setPetId("");
                    setSelectedService("");
                    setCurrentLocation(null);
                    setUseCurrentLocation(false);
                    setMapSelectMode(false);
                    setCompletedAppointment(null);
                  }}
                  className="px-6 py-3 border border-white/20 text-gray-200 rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Book Another Mobile Service
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
                disabled={
                  isSubmitting ||
                  (activeStep === 1 && (!petId || !selectedService))
                }
                className={`px-6 py-2 bg-[#A6E3E9] text-[#22292F] rounded-lg font-medium hover:bg-[#71C9CE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center${
                  activeStep === 1 && (!petId || !selectedService) ? ' opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : activeStep === 3 ? (
                  'Confirm Request'
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

export default MobileServiceMain;
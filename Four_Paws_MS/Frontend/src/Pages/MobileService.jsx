import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import StepIndicator from "@/Components/Appointment/StepIndicator";
import AuthRequiredCard from "@/Components/Appointment/AuthRequiredCard";
import AddPetModal from "@/Components/Appointment/AddPetModal";
import MapComponent from "@/Components/Appointment/MapComponent";

const MobileServiceMain = () => {
  const navigate = useNavigate();
  
  // Auth states
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Pet states
  const [userPets, setUserPets] = useState([]);
  
  // Form states
  const [activeTab, setActiveTab] = useState("pet-info-and-service");
  const [userId, setUserId] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [petDetails, setPetDetails] = useState({
    pet_id: "",
    pet_name: "",
    special_notes: "",
    pet_type: ""
  });
  const [userAddress, setUserAddress] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [serviceOptions, setServiceOptions] = useState([]);
  
  // Location selection states
  const [mapSelectMode, setMapSelectMode] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/auth/user", { 
          withCredentials: true 
        });
        
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
          setUserId(response.data.id);
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

  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const reasonsRes = await axios.get("http://localhost:3001/appointments/reasons");
          setServiceOptions(reasonsRes.data);
        } catch (err) {
          toast.error("Failed to fetch data. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isAuthenticated, user?.id]);

  const handleRedirectToLogin = () => {
    navigate("/login");
  };
  
  // Fetch user's pets
  useEffect(() => {
    const fetchUserPets = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/pets?id=${userId}`);
        setUserPets(response.data || []);
      } catch (error) {
        toast.error("Failed to fetch pets data");
        setUserPets([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPets();
  }, [userId]);
  
  // Fetch user's address
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/mobileservice/address?id=${userId}`);
        if (response.data?.length > 0) {
          setUserAddress(response.data[0].Owner_address);
        }
      } catch (error) {
        console.error("Error fetching user address:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAddress();
  }, [userId]);
  
  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({ 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude 
          });
          setUseCurrentLocation(true);
          setMapSelectMode(false);
          setLoading(false);
          toast.success("Location detected");
        },
        (error) => {
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

  // Handle pet selection
  const handlePetSelection = (petId) => {
    if (petId === "new") {
      setPetDetails({
        pet_id: "new",
        pet_name: "",
        special_notes: "",
        pet_type: ""
      });
    } else if (petId) {
      const selectedPet = userPets.find(pet => pet.Pet_id.toString() === petId);
      if (selectedPet) {
        setPetDetails({
          pet_id: selectedPet.Pet_id,
          pet_name: selectedPet.Pet_name,
          pet_type: selectedPet.Pet_type,
          special_notes: selectedPet.special_notes || ""
        });
      }
    } else {
      setPetDetails({
        pet_id: "",
        pet_name: "",
        special_notes: "",
        pet_type: ""
      });
    }
  };
  
  // Handle pet detail changes
  const handlePetDetailChange = (e) => {
    const { name, value } = e.target;
    setPetDetails(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission for step 1
  const handleContinueToLocation = () => {
    if (!petDetails.pet_name && petDetails.pet_id === "new") {
      toast.error("Please provide your pet's name");
      return;
    }
    if (!selectedService) {
      toast.error("Please select a service type");
      return;
    }
    setActiveTab("location");
  };
  
  // Handle location submission
  const handleLocationSubmit = () => {
    if (!useCurrentLocation && !userAddress) {
      toast.error("Please select a location option");
      return;
    }
    setActiveTab("confirmation");
  };
  
  // Handle final submission
  const handleSubmitAppointment = async () => {
    setLoading(true);
    
    try {
      const locationData = useCurrentLocation ? 
        { 
          type: "coordinates", 
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        } : 
        { type: "address", value: userAddress };
      
      const appointmentData = {
        user_id: userId,
        pet_details: petDetails,
        service_id: selectedService,
        location: locationData,
        status: "pending"
      };
      
      await axios.post("http://localhost:3001/api/mobileservice", appointmentData);
      toast.success("Mobile appointment booked successfully!");
      setActiveTab("complete");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh pets list
  const refreshPets = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/pets?id=${userId}`);
      setUserPets(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch pets data");
    } finally {
      setLoading(false);
    }
  };
  

  // Pet Info and Service Selection Component (Step 1)
  const PetInfoAndServiceSelector = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-[#A6E3E9]">Appointment Details</h2>
      {isAuthenticated ? (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-[#A6E3E9]">Pet Information</h3>
            
            <div className="mb-4">
              <label className="block text-gray-200 mb-2">Select your pet</label>
              <div className="flex items-center gap-2">
                <select
                  className="w-full p-2 border border-gray-300 rounded-md bg-white/10 text-gray-200 focus:ring-2 focus:ring-[#A6E3E9] focus:border-transparent"
                  onChange={(e) => handlePetSelection(e.target.value)}
                >
                  <option value="">Select a pet</option>
                  {userPets.map(pet => (
                    <option key={pet.Pet_id} value={pet.Pet_id.toString()}>
                      {pet.Pet_name} ({pet.Pet_type})
                    </option>
                  ))}
                </select>
                <AddPetModal onPetAdded={refreshPets} userId={userId} />
              </div>
            </div>
            
            {petDetails.pet_id === "new" && (
              <div className="mt-4">
                <label className="block text-gray-200 mb-2">Pet Name</label>
                <input
                  type="text"
                  name="pet_name"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white/10 text-gray-200"
                  value={petDetails.pet_name}
                  onChange={handlePetDetailChange}
                  required
                />
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-gray-200 mb-2">Service Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md bg-white/10 text-gray-200 focus:ring-2 focus:ring-[#A6E3E9] focus:border-transparent"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">Select a service</option>
                {serviceOptions.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.reason_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-200 mb-1">Special Notes</label>
              <textarea
                name="special_notes"
                className="w-full p-2 border border-gray-300 rounded-md bg-white/10 text-gray-200"
                rows="3"
                value={petDetails.special_notes}
                onChange={handlePetDetailChange}
                placeholder="Any special needs or concerns?"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              className="px-6 py-2 rounded-md bg-[#A6E3E9] text-[#22292F] hover:bg-[#71C9CE] font-bold transition duration-300 flex items-center"
              onClick={handleContinueToLocation}
            >
              Continue
              <svg 
                className="w-5 h-5 ml-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <AuthRequiredCard onLogin={handleRedirectToLogin} />
      )}
    </div>
  );
  
  // LocationSelector component (Step 2)
  const LocationSelector = () => {
    return (
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-[#A6E3E9]">Service Location</h2>
        <p className="mb-4 text-gray-200">Choose where you'd like us to provide the service</p>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="current-location"
              name="location-type"
              className="h-4 w-4 text-[#A6E3E9]"
              checked={useCurrentLocation && !mapSelectMode}
              onChange={() => {
                setUseCurrentLocation(true);
                setMapSelectMode(false);
                getCurrentLocation();
              }}
            />
            <label htmlFor="current-location" className="text-gray-200">Use my GPS location</label>
            <button 
              onClick={getCurrentLocation}
              className="ml-2 px-3 py-1 bg-[#A6E3E9] text-[#22292F] text-sm rounded hover:bg-[#71C9CE] disabled:opacity-50 disabled:cursor-not-allowed font-bold transition duration-300"
              disabled={loading}
            >
              {loading ? "Detecting..." : "Detect GPS"}
            </button>
          </div>

          {currentLocation && useCurrentLocation && !mapSelectMode && (
            <div className="ml-7 text-sm text-gray-200 bg-white/10 p-3 rounded-md border border-gray-200/20">
              <p className="font-medium mb-1 text-[#A6E3E9]">GPS Location</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#A6E3E9]/20 text-[#A6E3E9] px-2 py-1 rounded text-xs">
                  Lat: {currentLocation.latitude.toFixed(6)}
                </span>
                <span className="bg-[#A6E3E9]/20 text-[#A6E3E9] px-2 py-1 rounded text-xs">
                  Lng: {currentLocation.longitude.toFixed(6)}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="map-selection"
              name="location-type"
              className="h-4 w-4 text-[#A6E3E9]"
              checked={mapSelectMode}
              onChange={() => {
                setUseCurrentLocation(false);
                setMapSelectMode(true);
                if (!currentLocation && navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setCurrentLocation({ 
                        latitude: position.coords.latitude, 
                        longitude: position.coords.longitude 
                      });
                    },
                    (error) => {
                      console.error("Error getting location:", error);
                    }
                  );
                }
              }}
            />
            <label htmlFor="map-selection" className="text-gray-200">Select from Map</label>
          </div>
          
          {mapSelectMode && (
            <div className="mt-4 space-y-4">
              <div className="border border-gray-200/20 rounded-md overflow-hidden" style={{ height: '400px' }}>
                <MapComponent 
                  position={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : null}
                  onPositionChange={(latlng) => {
                    setCurrentLocation({ latitude: latlng.lat, longitude: latlng.lng });
                    setUseCurrentLocation(true);
                  }}
                  height="100%"
                />
              </div>
              
              <div className="text-xs text-gray-300 italic">
                Click anywhere on the map to select a location
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="saved-address"
              name="location-type"
              className="h-4 w-4 text-[#A6E3E9]"
              checked={!useCurrentLocation && !mapSelectMode}
              onChange={() => {
                setUseCurrentLocation(false);
                setMapSelectMode(false);
              }}
            />
            <label htmlFor="saved-address" className="text-gray-200">Use my address</label>
          </div>
          
          {!useCurrentLocation && !mapSelectMode && (
            <div className="ml-7">
              <textarea
                className="w-full p-2 border border-gray-200/20 rounded-md bg-white/10 text-gray-200 focus:ring-2 focus:ring-[#A6E3E9] focus:border-transparent"
                rows="3"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="Enter your address"
              />
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            className="px-6 py-2 rounded-md bg-gray-200/20 text-gray-200 hover:bg-gray-200/30 font-bold transition duration-300 flex items-center"
            onClick={() => setActiveTab("pet-info-and-service")}
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back
          </button>
          <button
            className="px-6 py-2 rounded-md bg-[#A6E3E9] text-[#22292F] hover:bg-[#71C9CE] font-bold transition duration-300 flex items-center"
            onClick={handleLocationSubmit}
            disabled={loading || (!useCurrentLocation && !userAddress)}
          >
            Continue
            <svg 
              className="w-5 h-5 ml-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // Confirmation component (Step 3)
  const AppointmentConfirmation = () => {
    const selectedServiceObj = serviceOptions.find(s => s.id === parseInt(selectedService));
    
    return (
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-[#A6E3E9]">Confirm Your Appointment</h2>
        
        <div className="space-y-4">
          <div className="border-b border-gray-200/20 pb-3">
            <h3 className="font-medium text-[#A6E3E9]">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-x-4 mt-2">
              <p className="text-gray-200">Service:</p>
              <p className="text-gray-200">{selectedServiceObj?.reason_name || "Not specified"}</p>
            </div>
          </div>
          
          <div className="border-b border-gray-200/20 pb-3">
            <h3 className="font-medium text-[#A6E3E9]">Pet Information</h3>
            <div className="grid grid-cols-2 gap-x-4 mt-2">
              <p className="text-gray-200">Name:</p>
              <p className="text-gray-200">{petDetails.pet_name}</p>
              
              <p className="text-gray-200">Type:</p>
              <p className="text-gray-200">{petDetails.pet_type}</p>
              
              {petDetails.special_notes && (
                <>
                  <p className="text-gray-200">Special Notes:</p>
                  <p className="text-gray-200">{petDetails.special_notes}</p>
                </>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-[#A6E3E9]">Location</h3>
            <p className="text-gray-200 mt-2">
              {useCurrentLocation 
                ? `Coordinates: (${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)})`
                : userAddress}
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            className="px-6 py-2 rounded-md bg-gray-200/20 text-gray-200 hover:bg-gray-200/30 font-bold transition duration-300 flex items-center"
            onClick={() => setActiveTab("location")}
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back
          </button>
          <button
            className="px-6 py-2 rounded-md bg-[#A6E3E9] text-[#22292F] hover:bg-[#71C9CE] font-bold transition duration-300 flex items-center"
            onClick={handleSubmitAppointment}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Booking"}
            {!loading && (
              <svg 
                className="w-5 h-5 ml-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  // Complete component (Step 4)
  const AppointmentComplete = () => (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mb-6 text-center">
      <div className="text-[#A6E3E9] text-6xl mb-4">✓</div>
      <h2 className="text-2xl font-semibold mb-2 text-[#A6E3E9]">Mobile Service Requested Successfully!</h2>
      <p className="text-gray-200 mb-6">Thank you for booking our mobile veterinary service. You will receive a confirmation via email.</p>
      
      <button
        className="px-6 py-2 rounded-md bg-[#A6E3E9] text-[#22292F] hover:bg-[#71C9CE] font-bold transition duration-300 flex items-center mx-auto"
        onClick={() => window.location.href = "/"}
      >
        Return to Home
        <svg 
          className="w-5 h-5 ml-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
          />
        </svg>
      </button>
    </div>
  );
  
  const getStepForIndicator = () => {
    switch (activeTab) {
      case "pet-info-and-service": return "pet-info";
      case "location": return "location";
      case "confirmation": return "confirmation";
      case "complete": return "complete";
      default: return "pet-info";
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F]">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#A6E3E9] mb-4">Mobile Veterinary Services</h1>
            <p className="text-lg text-gray-200">Bringing professional pet care directly to your doorstep</p>
          </div>
          
          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A6E3E9] mx-auto"></div>
              <p className="mt-4 text-gray-200">Loading...</p>
            </div>
          ) : (
            <>
              <div className="sticky top-4 z-50 bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 shadow-lg">
                <StepIndicator 
                  steps={["pet-info", "location", "confirmation", "complete"]}
                  activeStep={getStepForIndicator()}
                  stepLabels={["Pet & Service", "Location", "Confirmation", "Complete"]}
                />
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                {activeTab !== "pet-info-and-service" && (
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        if (activeTab === "location") setActiveTab("pet-info-and-service");
                        else if (activeTab === "confirmation") setActiveTab("location");
                        else if (activeTab === "complete") setActiveTab("confirmation");
                      }}
                      className="flex items-center text-gray-200 hover:text-[#A6E3E9] transition-colors duration-300"
                    >
                      <svg 
                        className="w-5 h-5 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 19l-7-7 7-7" 
                        />
                      </svg>
                      Back
                    </button>
                  </div>
                )}
                
                {activeTab === "pet-info-and-service" && <PetInfoAndServiceSelector />}
                {activeTab === "location" && <LocationSelector />}
                {activeTab === "confirmation" && <AppointmentConfirmation />}
                {activeTab === "complete" && <AppointmentComplete />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileServiceMain;
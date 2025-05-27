import React, { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Calendar } from "@/Components/ui/calendar";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Separator } from "@/Components/ui/separator";
import { toast } from "react-hot-toast";
import { Checkbox } from "@/Components/ui/checkbox";
import { PawPrint, CalendarClock, MapPin, ArrowRight, CreditCard, Check } from "lucide-react";
import MobileServiceLocation from "./MobileService";
import axios from "axios";

const MobileServiceMain = () => {
  const [activeTab, setActiveTab] = useState("services");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [petDetails, setPetDetails] = useState({
    pet_id: "",
    pet_name: "",
    pet_type: "",
    pet_breed: "",
    pet_age: "",
    pet_weight: "",
    special_notes: ""
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userPets, setUserPets] = useState([]);
  
  // Fetch user's pets
  React.useEffect(() => {
    const fetchUserPets = async () => {
      if (!userId) return;
      
      try {
        const response = await axios.get(`http://localhost:3001/api/pets/${userId}`);
        setUserPets(response.data || []);
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    };
    
    fetchUserPets();
  }, [userId]);
  
  // Services available for mobile
  const serviceOptions = [
    {
      id: 1,
      name: "Basic Health Check",
      description: "Complete physical examination of your pet",
      price: 75,
      duration: 30,
      icon: "🩺"
    },
    {
      id: 2,
      name: "Vaccination",
      description: "Essential vaccines for your pet's protection",
      price: 55,
      duration: 15,
      icon: "💉"
    },
    {
      id: 3,
      name: "Grooming",
      description: "Complete grooming service at your home",
      price: 90,
      duration: 60,
      icon: "✂️"
    },
    {
      id: 4,
      name: "Microchipping",
      description: "Permanent ID implantation for your pet",
      price: 45,
      duration: 15,
      icon: "🔍"
    },
    {
      id: 5,
      name: "Dental Check",
      description: "Comprehensive dental examination",
      price: 65,
      duration: 30,
      icon: "🦷"
    }
  ];
  
  // Available time slots
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
  ];
  
  // Handle service selection
  const toggleService = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };
  
  // Handle pet selection
  const handlePetSelection = (petId) => {
    if (petId === "new") {
      setPetDetails({
        pet_id: "new",
        pet_name: "",
        pet_type: "",
        pet_breed: "",
        pet_age: "",
        pet_weight: "",
        special_notes: ""
      });
    } else {
      const selectedPet = userPets.find(pet => pet.id === petId);
      if (selectedPet) {
        setPetDetails({
          pet_id: selectedPet.id,
          pet_name: selectedPet.name,
          pet_type: selectedPet.type,
          pet_breed: selectedPet.breed,
          pet_age: selectedPet.age,
          pet_weight: selectedPet.weight,
          special_notes: selectedPet.special_notes || ""
        });
      }
    }
  };
  
  // Handle pet detail changes
  const handlePetDetailChange = (e) => {
    const { name, value } = e.target;
    setPetDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Calculate total price
  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = serviceOptions.find(s => s.id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);
  };
  
  // Handle location selection
  const handleLocationSelected = (location) => {
    setSelectedLocation(location);
    handleSubmitAppointment(location);
  };
  
  // Handle form submission by tab
  const handleContinue = () => {
    if (activeTab === "services") {
      if (selectedServices.length === 0) {
        toast.error("Please select at least one service");
        return;
      }
      setActiveTab("schedule");
    } 
    else if (activeTab === "schedule") {
      if (!selectedDate) {
        toast.error("Please select a date");
        return;
      }
      if (!selectedTime) {
        toast.error("Please select a time");
        return;
      }
      setActiveTab("pet-info");
    }
    else if (activeTab === "pet-info") {
      if (!petDetails.pet_name) {
        toast.error("Please provide your pet's name");
        return;
      }
      if (!petDetails.pet_type) {
        toast.error("Please specify your pet's type");
        return;
      }
      setActiveTab("location");
    }
  };
  
  // Handle final submission
  const handleSubmitAppointment = async (locationData) => {
    setLoading(true);
    
    try {
      const appointmentData = {
        user_id: userId,
        services: selectedServices,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        pet_details: petDetails,
        location: locationData || selectedLocation,
        total_amount: calculateTotal(),
        status: "pending"
      };
      
      const response = await axios.post("http://localhost:3001/api/mobile-appointments", appointmentData);
      
      if (response.data) {
        toast.success("Mobile service appointment booked successfully!");
        setActiveTab("confirmation");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(error.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#008879] mb-2">Mobile Veterinary Services</h1>
          <p className="text-gray-600">Bringing professional pet care directly to your doorstep</p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="flex gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "services" || activeTab === "schedule" || activeTab === "pet-info" || activeTab === "location" || activeTab === "confirmation" ? "bg-[#008879] text-white" : "bg-gray-200 text-gray-600"}`}>
                1
              </div>
              <div className={`w-20 h-1 mt-4 ${activeTab === "schedule" || activeTab === "pet-info" || activeTab === "location" || activeTab === "confirmation" ? "bg-[#008879]" : "bg-gray-200"}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "schedule" || activeTab === "pet-info" || activeTab === "location" || activeTab === "confirmation" ? "bg-[#008879] text-white" : "bg-gray-200 text-gray-600"}`}>
                2
              </div>
              <div className={`w-20 h-1 mt-4 ${activeTab === "pet-info" || activeTab === "location" || activeTab === "confirmation" ? "bg-[#008879]" : "bg-gray-200"}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "pet-info" || activeTab === "location" || activeTab === "confirmation" ? "bg-[#008879] text-white" : "bg-gray-200 text-gray-600"}`}>
                3
              </div>
              <div className={`w-20 h-1 mt-4 ${activeTab === "location" || activeTab === "confirmation" ? "bg-[#008879]" : "bg-gray-200"}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "location" || activeTab === "confirmation" ? "bg-[#008879] text-white" : "bg-gray-200 text-gray-600"}`}>
                4
              </div>
            </div>
          </div>
          <div className="flex justify-center text-xs md:text-sm gap-3 text-gray-500">
            <span className={activeTab === "services" ? "font-semibold text-[#008879]" : ""}>Services</span>
            <span className={activeTab === "schedule" ? "font-semibold text-[#008879]" : ""}>Schedule</span>
            <span className={activeTab === "pet-info" ? "font-semibold text-[#008879]" : ""}>Pet Info</span>
            <span className={activeTab === "location" ? "font-semibold text-[#008879]" : ""}>Location</span>
          </div>
        </div>
        
        {activeTab === "services" && (
          <Card className="shadow-lg border-t-4 border-t-[#008879]">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xl flex items-center">
                <PawPrint className="mr-2 h-5 w-5 text-[#008879]" />
                Select Mobile Services
              </CardTitle>
              <CardDescription>Choose the services you need for your pet</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                {serviceOptions.map((service) => (
                  <div 
                    key={service.id}
                    className={`border rounded-lg p-4 cursor-pointer hover:border-[#008879] transition-all ${selectedServices.includes(service.id) ? 'border-[#008879] bg-green-50' : 'border-gray-200'}`}
                    onClick={() => toggleService(service.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{service.icon}</div>
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          <p className="text-xs text-gray-500">Duration: {service.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className="font-medium">${service.price}</p>
                        <Checkbox
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => toggleService(service.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Selected Services:</span>
                  <span className="font-medium">{selectedServices.length}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">${calculateTotal()}</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t bg-slate-50 flex justify-end">
              <Button 
                onClick={handleContinue}
                className="bg-[#008879] hover:bg-[#07776b] text-white"
              >
                Continue
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {activeTab === "schedule" && (
          <Card className="shadow-lg border-t-4 border-t-[#008879]">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xl flex items-center">
                <CalendarClock className="mr-2 h-5 w-5 text-[#008879]" />
                Schedule Your Appointment
              </CardTitle>
              <CardDescription>Select a convenient date and time</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block font-medium">Select Date</Label>
                  <div className="border rounded-md p-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => 
                        date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                        date.getDay() === 0 || // Sunday
                        date.getDay() === 6    // Saturday
                      }
                      className="rounded-md border"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block font-medium">Select Time</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <div
                        key={time}
                        className={`border rounded-md p-3 text-center cursor-pointer hover:border-[#008879] transition-all ${selectedTime === time ? 'border-[#008879] bg-green-50 font-medium' : 'border-gray-200'}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t bg-slate-50 flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setActiveTab("services")}
              >
                Back
              </Button>
              <Button 
                onClick={handleContinue}
                className="bg-[#008879] hover:bg-[#07776b] text-white"
              >
                Continue
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {activeTab === "pet-info" && (
          <Card className="shadow-lg border-t-4 border-t-[#008879]">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xl flex items-center">
                <PawPrint className="mr-2 h-5 w-5 text-[#008879]" />
                Pet Information
              </CardTitle>
              <CardDescription>Tell us about the pet we'll be caring for</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              {userPets.length > 0 && (
                <>
                  <Label className="mb-2 block font-medium">Select a Pet</Label>
                  <Select
                    value={petDetails.pet_id || ""}
                    onValueChange={handlePetSelection}
                  >
                    <SelectTrigger className="mb-4">
                      <SelectValue placeholder="Select a pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {userPets.map(pet => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} ({pet.type})
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Add a new pet</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Separator className="my-4" />
                </>
              )}
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pet_name">Pet Name *</Label>
                    <Input
                      id="pet_name"
                      name="pet_name"
                      value={petDetails.pet_name}
                      onChange={handlePetDetailChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pet_type">Pet Type *</Label>
                    <Select
                      value={petDetails.pet_type}
                      onValueChange={(value) => setPetDetails(prev => ({ ...prev, pet_type: value }))}
                    >
                      <SelectTrigger id="pet_type">
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
                  <div>
                    <Label htmlFor="pet_breed">Breed/Species</Label>
                    <Input
                      id="pet_breed"
                      name="pet_breed"
                      value={petDetails.pet_breed}
                      onChange={handlePetDetailChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pet_age">Age</Label>
                    <Input
                      id="pet_age"
                      name="pet_age"
                      value={petDetails.pet_age}
                      onChange={handlePetDetailChange}
                      className="mt-1"
                      placeholder="e.g. 2 years"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="pet_weight">Weight (kg)</Label>
                  <Input
                    id="pet_weight"
                    name="pet_weight"
                    value={petDetails.pet_weight}
                    onChange={handlePetDetailChange}
                    className="mt-1"
                    type="number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="special_notes">Special Notes (allergies, medical history, etc.)</Label>
                  <textarea
                    id="special_notes"
                    name="special_notes"
                    value={petDetails.special_notes}
                    onChange={handlePetDetailChange}
                    className="mt-1 w-full p-2 rounded-md border border-gray-300"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t bg-slate-50 flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setActiveTab("schedule")}
              >
                Back
              </Button>
              <Button 
                onClick={handleContinue}
                className="bg-[#008879] hover:bg-[#07776b] text-white"
              >
                Continue
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {activeTab === "location" && (
          <MobileServiceLocation 
            onLocationSelected={handleLocationSelected} 
            userId={userId}
            onCancel={() => setActiveTab("pet-info")}
          />
        )}
        
        {activeTab === "confirmation" && (
          <Card className="shadow-lg border-t-4 border-t-green-500">
            <CardHeader className="bg-slate-50 border-b text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
              <CardDescription>Your mobile service appointment has been scheduled</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 text-center">
              <div className="space-y-6 max-w-md mx-auto">
                <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                  <p className="text-green-800">
                    We've sent a confirmation email with all the details of your appointment. Our team will arrive at your location on the scheduled date and time.
                  </p>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-2"><strong>Appointment ID:</strong> #MS{Math.floor(Math.random() * 10000)}</p>
                  <p className="mb-2"><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                </div>
                
                <Button 
                  onClick={() => window.location.href = "/"}
                  className="bg-[#008879] hover:bg-[#07776b] text-white"
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MobileServiceMain;
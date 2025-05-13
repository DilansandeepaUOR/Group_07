import React, { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { MapPin, Home, Plus, Navigation, Check, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

const MobileServiceLocation = ({ onLocationSelected, userId, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [existingAddresses, setExistingAddresses] = useState([]);
  const [selectedOption, setSelectedOption] = useState("existing");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState({ lat: 40.7128, lng: -74.006 });
  const [selectedTab, setSelectedTab] = useState("address-options");
  
  // Form for new address
  const [newAddressForm, setNewAddressForm] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    is_primary: false,
    notes: ""
  });

  // Fetch user's existing addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!userId) return;
      
      try {
        const response = await axios.get(`http://localhost:3001/api/addresses/${userId}`);
        setExistingAddresses(response.data || []);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Failed to load your saved addresses");
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [userId]);

  // Handle change in the new address form
  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setShowMap(true);
      toast.loading("Getting your location...");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapPosition({ lat: latitude, lng: longitude });
          toast.dismiss();
          toast.success("Location found!");
          
          // Here you would typically perform reverse geocoding to get the address
          // For demonstration, we'll just set coordinates in the form
          setNewAddressForm(prev => ({
            ...prev,
            address_line1: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: `${latitude},${longitude}`
          }));
        },
        (error) => {
          toast.dismiss();
          toast.error("Could not get your location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (selectedOption === "existing") {
        if (!selectedAddressId) {
          toast.error("Please select an address");
          setIsSubmitting(false);
          return;
        }
        
        const selectedAddress = existingAddresses.find(addr => addr.id === selectedAddressId);
        onLocationSelected(selectedAddress);
        toast.success("Service location selected");
      } 
      else if (selectedOption === "new") {
        // Validate new address form
        if (!newAddressForm.address_line1 || !newAddressForm.city || !newAddressForm.state || !newAddressForm.zip_code) {
          toast.error("Please fill in all required address fields");
          setIsSubmitting(false);
          return;
        }
        
        // Save new address to database
        const addressData = {
          ...newAddressForm,
          user_id: userId
        };
        
        const response = await axios.post("http://localhost:3001/api/addresses", addressData);
        onLocationSelected(response.data);
        toast.success("New address saved and selected for service");
      }
      else if (selectedOption === "map") {
        // Ensure we have coordinates selected
        if (!newAddressForm.coordinates) {
          toast.error("Please select a location on the map");
          setIsSubmitting(false);
          return;
        }
        
        onLocationSelected({
          address_line1: newAddressForm.address_line1,
          coordinates: newAddressForm.coordinates,
          is_temporary: true
        });
        toast.success("Map location selected for service");
      }
      
      setSelectedTab("confirmation");
    } catch (error) {
      console.error("Error processing location:", error);
      toast.error(error.response?.data?.message || "Failed to process location. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

//   // Preview map component (simplified)
//   const MapPreview = () => (
//     <div className="h-48 bg-slate-100 rounded-md flex items-center justify-center mb-4 relative">
//       <div className="text-center text-slate-500">
//         {showMap ? (
//           <>
//             <div className="absolute inset-0">
//               {/* In a real app, this would be a proper map component */}
//               <div className="w-full h-full bg-blue-50">
//                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//                   <MapPin className="h-8 w-8 text-red-500" />
//                 </div>
//               </div>
//             </div>
//             <div className="absolute bottom-2 right-2 z-10">
//               <Button 
//                 size="sm" 
//                 variant="secondary" 
//                 onClick={() => setShowMap(false)}
//                 className="bg-white shadow-md"
//               >
//                 Close Map
//               </Button>
//             </div>
//           </>
//         ) : (
//           <div className="p-4">
//             <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-400" />
//             <p>Map preview will appear here</p>
//             <Button 
//               variant="outline" 
//               size="sm" 
//               onClick={getCurrentLocation}
//               className="mt-2"
//             >
//               <Navigation className="h-4 w-4 mr-1" /> Use Current Location
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsContent value="address-options">
          <Card className="shadow-lg border-t-4 border-t-blue-500">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xl flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                Select Service Location
              </CardTitle>
              <CardDescription>Choose where you'd like us to provide service</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <RadioGroup 
                    value={selectedOption} 
                    onValueChange={setSelectedOption}
                    className="space-y-4"
                  >
                    {existingAddresses.length > 0 && (
                      <div className={`border rounded-lg p-4 ${selectedOption === 'existing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="existing" id="existing" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="existing" className="text-base font-medium flex items-center">
                              <Home className="h-4 w-4 mr-2" />
                              Use Saved Address
                            </Label>
                            
                            {selectedOption === 'existing' && (
                              <div className="mt-4 space-y-3">
                                {existingAddresses.map((address) => (
                                  <div 
                                    key={address.id}
                                    className={`p-3 border rounded-md cursor-pointer ${selectedAddressId === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-slate-50'}`}
                                    onClick={() => setSelectedAddressId(address.id)}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="font-medium">{address.address_line1}</p>
                                        {address.address_line2 && <p className="text-sm text-gray-600">{address.address_line2}</p>}
                                        <p className="text-sm text-gray-600">
                                          {address.city}, {address.state} {address.zip_code}
                                        </p>
                                      </div>
                                      {selectedAddressId === address.id && (
                                        <div className="ml-2">
                                          <Check className="h-5 w-5 text-blue-500" />
                                        </div>
                                      )}
                                    </div>
                                    {address.is_primary && (
                                      <div className="mt-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                          Primary Address
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className={`border rounded-lg p-4 ${selectedOption === 'new' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="new" id="new" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="new" className="text-base font-medium flex items-center">
                            <Plus className="h-4 w-4 mr-2" />
                            Enter New Address
                          </Label>
                          
                          {selectedOption === 'new' && (
                            <div className="mt-4 space-y-4">
                              <div>
                                <Label htmlFor="address_line1" className="text-sm font-medium">Address Line 1 *</Label>
                                <Input
                                  id="address_line1"
                                  name="address_line1"
                                  value={newAddressForm.address_line1}
                                  onChange={handleNewAddressChange}
                                  className="mt-1"
                                  placeholder="Street address"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="address_line2" className="text-sm font-medium">Address Line 2</Label>
                                <Input
                                  id="address_line2"
                                  name="address_line2"
                                  value={newAddressForm.address_line2}
                                  onChange={handleNewAddressChange}
                                  className="mt-1"
                                  placeholder="Apartment, suite, unit, etc."
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                                  <Input
                                    id="city"
                                    name="city"
                                    value={newAddressForm.city}
                                    onChange={handleNewAddressChange}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="state" className="text-sm font-medium">State *</Label>
                                  <Input
                                    id="state"
                                    name="state"
                                    value={newAddressForm.state}
                                    onChange={handleNewAddressChange}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="zip_code" className="text-sm font-medium">ZIP Code *</Label>
                                <Input
                                  id="zip_code"
                                  name="zip_code"
                                  value={newAddressForm.zip_code}
                                  onChange={handleNewAddressChange}
                                  className="mt-1"
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="is_primary"
                                  name="is_primary"
                                  checked={newAddressForm.is_primary}
                                  onChange={handleNewAddressChange}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="is_primary" className="text-sm">Set as primary address</Label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`border rounded-lg p-4 ${selectedOption === 'map' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="map" id="map" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="map" className="text-base font-medium flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Pick Location on Map
                          </Label>
                          
                          {selectedOption === 'map' && (
                            <div className="mt-4">
                              <MapPreview />
                              
                              {newAddressForm.coordinates && (
                                <div className="bg-green-50 p-3 rounded-md border border-green-100 mb-4">
                                  <p className="text-sm text-green-700">
                                    <Check className="h-4 w-4 inline mr-1" />
                                    Location selected: {newAddressForm.address_line1}
                                  </p>
                                </div>
                              )}
                              
                              <div>
                                <Label htmlFor="notes" className="text-sm font-medium">Additional Instructions (Optional)</Label>
                                <Textarea
                                  id="notes"
                                  name="notes"
                                  value={newAddressForm.notes}
                                  onChange={handleNewAddressChange}
                                  className="mt-1"
                                  placeholder="Provide any additional details about the location"
                                  rows={3}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#008879] hover:bg-[#07776b] text-white"
                    >
                      {isSubmitting ? "Saving..." : "Continue"}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="confirmation">
          <Card className="shadow-lg border-t-4 border-t-green-500">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center justify-center mb-2">
                <Check className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-xl text-center">Location Confirmed</CardTitle>
              <CardDescription className="text-center">Your service location has been set</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100 mb-6">
                  <p className="text-center text-green-700">
                    Your mobile service location has been confirmed. Our team will arrive at this address at the scheduled time.
                  </p>
                </div>
                
                <Button 
                  variant="default" 
                  className="w-full bg-[#008879] hover:bg-[#07776b] text-white"
                  onClick={() => onLocationSelected(null)} // This would typically navigate back to the appointment booking flow
                >
                  Continue to Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileServiceLocation;
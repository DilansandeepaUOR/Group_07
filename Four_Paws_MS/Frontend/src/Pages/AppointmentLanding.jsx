import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { FaClinicMedical, FaAmbulance, FaPlus } from "react-icons/fa";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import AuthRequiredCard from "@/Components/Appointment/AuthRequiredCard";
import ServiceListItem from "@/Components/Appointment/ServiceListItem";
import ServiceFilter from "@/Components/Appointment/ServiceFilter";

function AppointmentLanding() {
  const navigate = useNavigate();
  
  // Auth states
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [appointments, setAppointments] = useState([]);
  const [mobileServices, setMobileServices] = useState([]);
  const [serviceType, setServiceType] = useState("all"); // "all", "clinic", "mobile"
  const [statusFilter, setStatusFilter] = useState("all");
  
  // UI states
  const [noAppointments, setNoAppointments] = useState(false);
  const [noMobileServices, setNoMobileServices] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

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

  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserData();
    }
  }, [isAuthenticated, user?.id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch clinic appointments
      const appointmentRes = await axios.get(`http://localhost:3001/appointments?id=${user.id}`);
      if (appointmentRes.data && appointmentRes.data.msg === false) {
        setNoAppointments(true);
        setAppointments([]);
      } else {
        setAppointments(appointmentRes.data || []);
        setNoAppointments(false);
      }

      // Fetch mobile services
      try {
        const mobileRes = await axios.get(`http://localhost:3001/api/mobileservice/user/${user.id}`);
        if (mobileRes.data && mobileRes.data.length === 0) {
          setNoMobileServices(true);
          setMobileServices([]);
        } else {
          setMobileServices(mobileRes.data || []);
          setNoMobileServices(false);
        }
      } catch (mobileError) {
        console.error("Error fetching mobile services:", mobileError);
        setNoMobileServices(true);
        setMobileServices([]);
      }
      
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      toast.error("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToLogin = () => {
    navigate("/login");
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

  const handleCancelMobileService = async (serviceId) => {
    // Find the service to check its status
    const service = mobileServices.find(s => s.id === serviceId);
    if (!service) {
      toast.error("Mobile service not found.");
      return;
    }
    if (service.status.toLowerCase() !== "pending") {
      toast.error("Only pending mobile services can be cancelled.");
      return;
    }
    try {
      setIsCancelling(true);
      setCancellingAppointmentId(serviceId);
      await axios.put(`http://localhost:3001/api/mobileservice/cancel/${serviceId}`);
      setMobileServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? {...service, status: "Cancelled"} 
            : service
        )
      );
      toast.success("Mobile service cancelled successfully");
    } catch (error) {
      console.error("Error cancelling mobile service:", error);
      toast.error(error.response?.data?.error || "Failed to cancel mobile service. Please try again.");
    } finally {
      setIsCancelling(false);
      setCancellingAppointmentId(null);
    }
  };

  const getFilteredData = () => {
    let filteredData = [];
    
    if (serviceType === "all" || serviceType === "clinic") {
      const filteredAppointments = statusFilter === "all" 
        ? appointments 
        : appointments.filter(app => app.status === statusFilter);
      filteredData.push(...filteredAppointments.map(app => ({
        ...app,
        type: "clinic",
        displayId: app.appointment_id,
        displayName: app.Pet_name || app.petType,
        displayDate: app.appointment_date,
        displayTime: app.appointment_time,
        displayReason: app.reason,
        displayStatus: app.status,
        displayLocation: "Clinic",
        onCancel: () => handleCancelAppointment(app.appointment_id)
      })));
    }
    
    if (serviceType === "all" || serviceType === "mobile") {
      const filteredMobileServices = statusFilter === "all" 
        ? mobileServices 
        : mobileServices.filter(service => service.status === statusFilter);
      filteredData.push(...filteredMobileServices.map(service => ({
        ...service,
        type: "mobile",
        displayId: service.id,
        displayName: service.Pet_name || "Unnamed Pet",
        displayDate: service.created_at,
        displayTime: service.appointment_time || "Flexible",
        displayReason: service.service_type || "Mobile Service",
        displayStatus: service.status,
        displayType: service.type,
        displayLocation: service.type === "coordinates" 
          ?(
            <a
              href={`https://www.google.com/maps?q=${parseFloat(service.latitude)},${parseFloat(service.longitude)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              GPS: {parseFloat(service.latitude).toFixed(4)}, {parseFloat(service.longitude).toFixed(4)}
            </a>
          )
          : service.address || "Address provided",
        onCancel: () => handleCancelMobileService(service.id)
      })));
    }
    
    return filteredData.sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));
  };

  const hasNoData = () => {
    if (serviceType === "clinic") return noAppointments;
    if (serviceType === "mobile") return noMobileServices;
    return noAppointments && noMobileServices;
  };

  const getEmptyMessage = () => {
    if (serviceType === "clinic") return "No clinic appointments found";
    if (serviceType === "mobile") return "No mobile services found";
    return "No appointments or services found";
  };

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen flex flex-col">
    <Navbar />
    
    <div className="flex-grow bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F] py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#A6E3E9] mb-3 sm:mb-4 leading-tight">
            My Appointments & Services
          </h1>
          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto px-4 sm:px-0">
            View and manage your clinic appointments and mobile veterinary services
          </p>
        </div>
        
        {loading ? (
          <div className="text-center p-6 sm:p-8">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#A6E3E9] mx-auto"></div>
            <p className="mt-4 text-gray-200 text-sm sm:text-base">Loading...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="px-2 sm:px-0">
            <AuthRequiredCard onLogin={handleRedirectToLogin} />
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Service Type Selection */}
            <div className="px-2 sm:px-0">
              <ServiceFilter
                serviceType={serviceType}
                setServiceType={setServiceType}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onBookClinic={() => navigate("/appointment")}
                onBookMobile={() => navigate("/mobileservice")}
              />
            </div>

            {/* Appointments/Services List */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 mx-2 sm:mx-0">
              {hasNoData() ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 text-[#A6E3E9] opacity-50 flex justify-center">
                    {serviceType === "clinic" ? <FaClinicMedical /> : 
                     serviceType === "mobile" ? <FaAmbulance /> : 
                     <FaPlus />}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#A6E3E9] mb-2 px-4">
                    {getEmptyMessage()}
                  </h3>
                  <p className="text-gray-200 mb-6 text-sm sm:text-base px-4 leading-relaxed">
                    {serviceType === "all" 
                      ? "You haven't booked any appointments or mobile services yet."
                      : serviceType === "clinic"
                      ? "You haven't booked any clinic appointments yet."
                      : "You haven't booked any mobile services yet."
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                    <button
                      onClick={() => navigate("/appointment")}
                      className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-[#A6E3E9] text-[#22292F] rounded-lg font-bold hover:bg-[#71C9CE] transition duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <FaClinicMedical className="text-sm sm:text-base" />
                      <span className="whitespace-nowrap">Book Clinic Appointment</span>
                    </button>
                    <button
                      onClick={() => navigate("/mobileservice")}
                      className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-[#A6E3E9] text-[#22292F] rounded-lg font-bold hover:bg-[#71C9CE] transition duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <FaAmbulance className="text-sm sm:text-base" />
                      <span className="whitespace-nowrap">Book Mobile Service</span>
                    </button>
                  </div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-200 text-sm sm:text-base px-4">
                    No items found with the selected filters
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredData.map((item) => (
                    <ServiceListItem
                      key={`${item.type}-${item.displayId}`}
                      item={item}
                      isCancelling={isCancelling}
                      cancellingAppointmentId={cancellingAppointmentId}
                      onCancel={item.onCancel}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    <Footer />
  </div>
  );
}

export default AppointmentLanding; 
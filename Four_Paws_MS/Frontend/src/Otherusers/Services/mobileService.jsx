import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, X, MapPin, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AssDoctorAppointmentTable from '../../Components/assdoctor/AppointmentTable';
import Loading from '../../app/loading';
import { Calendar as DatePicker } from '../../Components/ui/calendar';
import ConfirmDialog from '../../Components/ui/ConfirmDialog';
import RefreshButton from '../../Components/ui/RefreshButton';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MobileService = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [status, setStatus] = useState('confirmed');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = 'http://localhost:3001/api/mobile/assistantdoctor';
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default to Colombo
  const [showMap, setShowMap] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [allAppointments, setAllAppointments] = useState([]);
  const [formError, setFormError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [initialStatus, setInitialStatus] = useState('');
  const [updateMessage, setUpdateMessage] = useState(null); // { type: 'success'|'error', text: string }
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false); // Loading state for confirmation

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [todayRes, upcomingRes] = await Promise.all([
        axios.get(`${API_URL}/today`),
        axios.get(`${API_URL}/upcoming`)
      ]);

      setTodayAppointments(todayRes.data?.services || []);
      setUpcomingAppointments(upcomingRes.data?.services || []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to fetch appointments');
      setTodayAppointments([]);
      setUpcomingAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = async (appointmentId) => {
    try {
      const response = await axios.get(`${API_URL}/${appointmentId}`);
      if (response?.data?.service) {
        const service = response.data.service;
        setSelectedAppointment(service);
        setStatus(service.status || '');
        setInitialStatus(service.status || '');
        setNotes(service.special_notes || '');
        setAppointmentDate(service.date ? new Date(service.date) : null);
        setAppointmentTime(service.time || service.appointment_time || '');
        
        // Update map state
        if (service.latitude && service.longitude) {
          setMapCenter([parseFloat(service.latitude), parseFloat(service.longitude)]);
          setShowMap(true);
        } else {
          setShowMap(false);
        }
      } else {
        setError('Invalid appointment data received');
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch appointment details');
    }
  };

  const handleBack = () => {
    setSelectedAppointment(null);
    setStatus('');
    setNotes('');
    setShowMap(false);
    setAppointmentDate(null);
    setAppointmentTime('');
  };

  const handleUpdateAppointment = async () => {
    setFormError('');
    
    if (!selectedAppointment?.id) {
      setError('Invalid appointment selected');
      return;
    }
  
    // Identify which fields are missing
    const missingFields = [];
    if (!appointmentDate) missingFields.push('Date');
    if (!appointmentTime) missingFields.push('Time');
    if (!status?.trim()) missingFields.push('Status');
  
    if (missingFields.length > 0) {
      setFormError(`${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required.`);
      return;
    }
  
    // If everything is valid
    setFormError('');
    setShowConfirm(true);
  };
  

  const confirmUpdate = async () => {
    try {
      setIsUpdating(true); // Start loading
      await axios.put(`${API_URL}/appointment/${selectedAppointment.id}`, {
        status,
        special_notes: notes,
        date: appointmentDate ? appointmentDate.toISOString().split('T')[0] : undefined,
        time: appointmentTime
      });
      
      const emailInfo = selectedAppointment?.E_mail 
        ? `Confirmation email sent to ${selectedAppointment.E_mail}`
        : 'No email sent (no email address available)';
        
      setUpdateMessage({ 
        type: 'success', 
        text: `Appointment updated successfully. ${emailInfo}.` 
      });
      handleBack();
      fetchAppointments();
    } catch (err) {
      setUpdateMessage({ type: 'error', text: err?.message || 'Failed to update appointment' });
      setError(err?.message || 'Failed to update appointment');
    } finally {
      setIsUpdating(false); // Stop loading
      setShowConfirm(false);
      // Hide message after 5 seconds
      setTimeout(() => setUpdateMessage(null), 5000);
    }
  };

  const handleShowAll = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/all`);
      setAllAppointments(response.data?.services || []);
      setShowAll(true);
    } catch (err) {
      setError(err?.message || 'Failed to fetch all appointments');
    } finally {
      setLoading(false);
    }
  };
  const handleBackToFiltered = () => {
    setShowAll(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'Date not specified';
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString()} ${time || ''}`;
  };

  const getLocationDisplay = (appointment) => {
  if (!appointment) return 'Location not specified';

  if (appointment.latitude && appointment.longitude) {
    const lat = parseFloat(appointment.latitude);
    const lng = parseFloat(appointment.longitude);

    return (
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline"
        style={{ color: '#0668e0', textDecoration: 'underline' }}
      >
        View on Map
      </a>
    );
  }

  return appointment.address || 'Location not specified';
};


  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  // Filter for upcoming appointments: only show pending and confirmed (scheduled) appointments
  const filteredUpcomingAppointments = upcomingAppointments.filter(appt => {
    const status = (appt.status || '').toLowerCase();
    return (status === 'pending' || status === 'confirmed');
  }).filter(appt => {
    const term = searchTerm.toLowerCase();
    return (
      (appt.Pet_name && appt.Pet_name.toLowerCase().includes(term)) ||
      (appt.Owner_name && appt.Owner_name.toLowerCase().includes(term)) ||
      (appt.address && appt.address.toLowerCase().includes(term)) ||
      (appt.id && appt.id.toString().toLowerCase().includes(term))
    );
  });

  const filteredTodayAppointments = todayAppointments.filter(appt => {
    const term = searchTerm.toLowerCase();
    return (
      (appt.Pet_name && appt.Pet_name.toLowerCase().includes(term)) ||
      (appt.Owner_name && appt.Owner_name.toLowerCase().includes(term)) ||
      (appt.address && appt.address.toLowerCase().includes(term)) ||
      (appt.id && appt.id.toString().toLowerCase().includes(term))
    );
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  if (selectedAppointment) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-[#028478] hover:text-[#026e64] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Appointments
        </button>
        {/* Appointment Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Appointment Details</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
          
         
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Pet Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Pet Information
                </h3>
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{selectedAppointment.Pet_name || 'Not specified'}</dd>
                  <dt className="text-sm font-medium text-gray-500">Breed</dt>
                  <dd className="text-sm text-gray-900">{selectedAppointment.Pet_Breed || 'Not specified'}</dd>
                  <dt className="text-sm font-medium text-gray-500">Age</dt>
                  <dd className="text-sm text-gray-900">{selectedAppointment.Age || 'Not specified'}</dd>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="text-sm text-gray-900">{selectedAppointment.Pet_gender || 'Not specified'}</dd>
                </dl>
              </div>

              {/* Owner Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Owner Information
                </h3>
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{selectedAppointment.Owner_name || 'Not specified'}</dd>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{selectedAppointment.Phone_number || 'Not specified'}</dd>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900 flex items-center">
                    {selectedAppointment.E_mail || 'Not specified'}
                  </dd>
                </dl>
              </div>

            {/* Location Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location Information
                </h3>
                <p className="text-sm text-gray-900 mb-4">{getLocationDisplay(selectedAppointment)}</p>
                {showMap && selectedAppointment?.latitude && selectedAppointment?.longitude && (
                  <>
                    <div className="h-[250px] w-full rounded-lg overflow-hidden border border-gray-200 mb-4">
                      <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={mapCenter}>
                          <Popup>
                            {selectedAppointment.Pet_name}'s Appointment Location
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                    <button
                      onClick={() => openGoogleMaps(selectedAppointment.latitude, selectedAppointment.longitude)}
                      className="w-full flex items-center justify-center gap-2 bg-[#028478] text-white py-2 px-4 rounded-md hover:bg-[#026e64] transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z"/>
                      </svg>
                      Open in Maps
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              

              {/* Appointment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Set Appointment Details
                </h3>
                <div className="space-y-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>

                      <div className="flex items-center gap-4">
                        {/* Date Picker */}
                        <DatePicker 
                          required
                          classNames={{
                            day_selected: 'bg-[#008478] text-white',
                            day_today: 'border border-[#008478]',
                            nav_button: 'text-[#008478]',
                            caption_label: 'text-[#008478]',
                            root: 'text-[#008478]',
                          }}
                          mode="single"
                          selected={appointmentDate}
                          onSelect={setAppointmentDate}
                          className="rounded-md border"
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || initialStatus === 'completed' || initialStatus === 'confirmed' || initialStatus === 'cancelled'}
                        />

                        {/* Time Picker */}
                        <div>
                          <input
                            required
                            type="time"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                            className="border rounded-md px-2 py-1 text-[#008478]"
                            disabled={initialStatus === 'completed' || initialStatus === 'confirmed' || initialStatus === 'cancelled'}
                          />
                        </div>
                      </div>
                    </div>

                 
                  {initialStatus !== 'completed' && initialStatus !== 'cancelled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        required
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-[#008478] focus:border-[#008478] focus:ring-[#008478] focus:outline-none shadow-sm"
                        
                      >
                        {initialStatus === 'confirmed' ? (
                          <>
                            <option >Select Status</option>
                            <option value="completed">✓ Complete (sends email)</option>
                            <option value="cancelled">✗ Cancel (sends email)</option>
                          </>
                        ) : (
                          <>
                            <option >Select Status</option>
                            <option value="confirmed">✓ Confirm (sends email)</option>
                            <option value="completed">✓ Complete (sends email)</option>
                            <option value="cancelled">✗ Cancel (sends email)</option>
                          </>
                        )}
                      </select>
                      {selectedAppointment?.E_mail && (
                        <p className="mt-1 text-xs text-gray-500">
                          All status changes will send a confirmation email to {selectedAppointment.E_mail}
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    {initialStatus === 'completed' ? (
                      <div className="w-full rounded-md border-gray-300 shadow-sm bg-gray-100 p-2 min-h-[80px]">{notes || 'No notes provided.'}</div>
                    ) : (
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about the appointment..."
                        rows={4}
                        className="w-full p-3 rounded-md border-gray-300 shadow-sm focus:border-[#028478] focus:ring-[#028478]"
                        disabled={initialStatus === 'confirmed'}
                      />
                    )}
                    {selectedAppointment?.E_mail && (
                      <p className="mt-2 text-sm text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Notes will be included in the confirmation email sent to {selectedAppointment.E_mail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error message for required fields */}
          {formError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 text-sm font-medium">{formError}</span>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-100 bg-gray-400 rounded hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            {initialStatus !== 'completed' && (
              <button
                onClick={handleUpdateAppointment}
                className="bg-[#028478] text-white px-4 py-2 rounded hover:bg-[#046a5b]"
              >
                Update Appointment
              </button>
            )}
          </div>
        </div>
        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={showConfirm}
          title="Confirm Appointment Update"
          description={`Are you sure you want to update this appointment? A confirmation email will be sent to ${selectedAppointment?.E_mail || 'the pet owner'} with the updated details.`}
          confirmLabel={isUpdating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </span>
          ) : "Yes, Update & Send Email"}
          cancelLabel="Cancel"
          onConfirm={confirmUpdate}
          onCancel={() => setShowConfirm(false)}
          loading={isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search by pet, owner, address, or ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028478] mb-2 sm:mb-0"
        />
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          {!showAll && (
            <button
              onClick={handleShowAll}
              className="bg-[#028478] text-white px-4 py-2 rounded hover:bg-[#046a5b]"
            >
              Show All Mobile Services
            </button>
          )}
          {showAll && (
            <button
              onClick={handleBackToFiltered}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
          )}
          <RefreshButton onClick={fetchAppointments} />
        </div>
      </div>
      {showAll ? (
        <AssDoctorAppointmentTable
          title="All Mobile Services"
          appointments={allAppointments}
          onViewDetails={handleAppointmentClick}
          getLocationDisplay={getLocationDisplay}
          getStatusColor={getStatusColor}
          isToday={false}
          updateMessage={updateMessage}
        />
      ) : (
        <>
          <AssDoctorAppointmentTable
            title="Today's Mobile Appointments"
            appointments={filteredTodayAppointments}
            onViewDetails={handleAppointmentClick}
            getLocationDisplay={getLocationDisplay}
            getStatusColor={getStatusColor}
            isToday={true}
            updateMessage={updateMessage}
          />
          <AssDoctorAppointmentTable
            title="Upcoming Mobile Appointments"
            appointments={filteredUpcomingAppointments}
            onViewDetails={handleAppointmentClick}
            getLocationDisplay={getLocationDisplay}
            getStatusColor={getStatusColor}
            isToday={false}
            updateMessage={updateMessage}
          />
        </>
      )}
    </div>
  );
}

export default MobileService; 

import React, { useState, useEffect } from 'react';
import { mobileAssistantDoctorService } from '../services/mobileAssistantDoctorService';
import { Calendar, Clock, User, Phone, Mail, X } from 'lucide-react';

const MobileAssistantDoctor = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [todayData, upcomingData] = await Promise.all([
        mobileAssistantDoctorService.getTodayAppointments(),
        mobileAssistantDoctorService.getUpcomingAppointments()
      ]);
      setTodayAppointments(todayData.appointments);
      setUpcomingAppointments(upcomingData.appointments);
      setError(null);
    } catch (err) {
      setError(err.error || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = async (appointmentId) => {
    try {
      const response = await mobileAssistantDoctorService.getAppointmentDetails(appointmentId);
      setSelectedAppointment(response.appointment);
      setStatus(response.appointment.status);
      setNotes(response.appointment.notes || '');
      setShowModal(true);
    } catch (err) {
      setError(err.error || 'Failed to fetch appointment details');
    }
  };

  const handleUpdateAppointment = async () => {
    try {
      await mobileAssistantDoctorService.updateAppointment(
        selectedAppointment.appointment_id,
        status,
        notes
      );
      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      setError(err.error || 'Failed to update appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString()} ${time}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mobile Assistant Doctor Dashboard</h1>

      {/* Today's Appointments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todayAppointments.map((appointment) => (
            <div key={appointment.appointment_id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{appointment.Pet_name}</h3>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{appointment.appointment_time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{appointment.Owner_name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{appointment.Phone_number}</span>
                </div>
              </div>
              <button
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                onClick={() => handleAppointmentClick(appointment.appointment_id)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.appointment_id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{appointment.Pet_name}</h3>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDateTime(appointment.appointment_date, appointment.appointment_time)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{appointment.Owner_name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{appointment.Phone_number}</span>
                </div>
              </div>
              <button
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                onClick={() => handleAppointmentClick(appointment.appointment_id)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Appointment Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {selectedAppointment && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Pet Information</h3>
                    <div className="space-y-1 text-gray-600">
                      <p>Name: {selectedAppointment.Pet_name}</p>
                      <p>Breed: {selectedAppointment.Breed}</p>
                      <p>Age: {selectedAppointment.Age}</p>
                      <p>Gender: {selectedAppointment.Gender}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Owner Information</h3>
                    <div className="space-y-1 text-gray-600">
                      <p>Name: {selectedAppointment.Owner_name}</p>
                      <p>Phone: {selectedAppointment.Phone_number}</p>
                      <p>Email: {selectedAppointment.E_mail}</p>
                      <p>Address: {selectedAppointment.Owner_address}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Appointment Details</h3>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Date: {formatDateTime(selectedAppointment.appointment_date, selectedAppointment.appointment_time)}
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add notes about the appointment..."
                          rows={4}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleUpdateAppointment}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Update Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileAssistantDoctor; 
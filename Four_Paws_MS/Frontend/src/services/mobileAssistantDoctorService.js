import axios from 'axios';

const API_URL = 'http://localhost:3001/api/mobile/assistantdoctor';

export const mobileAssistantDoctorService = {
  // Get today's appointments
  getTodayAppointments: async () => {
    try {
      const response = await axios.get(`${API_URL}/today`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch today\'s appointments' };
    }
  },

  // Get upcoming appointments
  getUpcomingAppointments: async () => {
    try {
      const response = await axios.get(`${API_URL}/upcoming`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch upcoming appointments' };
    }
  },

  // Get appointment details
  getAppointmentDetails: async (appointmentId) => {
    try {
      const response = await axios.get(`${API_URL}/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch appointment details' };
    }
  },

  // Update appointment status
  updateAppointment: async (appointmentId, status, notes) => {
    try {
      const response = await axios.put(`${API_URL}/appointment/${appointmentId}`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update appointment' };
    }
  }
}; 
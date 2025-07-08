import React, { useEffect, useState } from 'react';
import AssDoctorAppointmentTable from '../Components/assdoctor/AppointmentTable';
import Loading from '../app/loading';
import axios from 'axios';

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/mobile/assistantdoctor/all');
        setAppointments(response.data?.services || []);
        setError(null);
      } catch (err) {
        setError(err?.message || 'Failed to fetch appointments');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="p-4 text-red-500 bg-red-100 rounded-lg">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-[#028478]">All Appointments</h1>
      <AssDoctorAppointmentTable
        title="All Appointments"
        appointments={appointments}
        onViewDetails={() => {}}
        getLocationDisplay={appt => appt.address || 'N/A'}
        getStatusColor={status => ''}
        isToday={false}
      />
    </div>
  );
};

export default AllAppointments; 
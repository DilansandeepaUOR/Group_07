import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [scheduled, setScheduled] = useState(0);
  const [cancelled, setCancelled] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const pageLimit = 20;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const endpoint = showAll
          ? `http://localhost:3001/api/assistantdoctor/all?page=${currentPage}&limit=${pageLimit}`
          : 'http://localhost:3001/api/assistantdoctor';

        const res = await axios.get(endpoint);
        const data = res.data;

        setAppointments(data.appointments || []);
        setTotal(data.total || 0);
        setCompleted(parseInt(data.completed) || 0);
        setScheduled(parseInt(data.scheduled) || 0);
        setCancelled(parseInt(data.cancelled) || 0);

        if (showAll) {
          setTotalPages(Math.ceil(data.total / pageLimit));
        } else {
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, [showAll, currentPage]);

  const toggleView = () => {
    setShowAll(!showAll);
    setCurrentPage(1);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleEdit = async (appointmentId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;
  
    try {
      await axios.put(`http://localhost:3001/api/assistantdoctor/${appointmentId}`, {
        status: 'Cancelled'
      });
  
      const updatedAppointments = appointments.map((a) =>
        a.appointment_id === appointmentId ? { ...a, status: 'Cancelled' } : a
      );
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };
  

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const DetailRow = ({ label, value }) => (
    <div>
      <span className="font-semibold">{label}:</span> <span>{value}</span>
    </div>
  );
  

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-[#028478]">
          {showAll ? "All Appointments" : "Today's Appointments"}
        </h2>
        <button
          onClick={toggleView}
          className="bg-[#028478] text-white px-4 py-2 rounded hover:bg-[#046a5b]"
        >
          {showAll ? "View Today's Appointments" : 'View All Appointments'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Appointments" value={total} />
        <StatCard title="Completed" value={completed} />
        <StatCard title="Scheduled" value={scheduled} />
        <StatCard title="Cancelled" value={cancelled} />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <table className="min-w-full">
          <thead className="bg-[#71C9CE]">
            <tr>
              {['Pet Type', 'Owner ID', 'Date & Time', 'Reason', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.appointment_id}>
                <td className="px-6 py-4 text-sm text-gray-900">{appointment.pet_type}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{appointment.owner_id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{appointment.reason}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button onClick={() => handleView(appointment)} className="text-[#028478] hover:text-[#71C9CE] mr-3">
                    View
                  </button>
                  {appointment.status.toLowerCase() !== 'cancelled' && appointment.status.toLowerCase() !== 'completed' && (
                    <button onClick={() => handleEdit(appointment.appointment_id)} className="text-[#028478] hover:text-[#71C9CE]">
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <p className="text-center py-4 text-gray-500">No appointments found.</p>
        )}
      </div>

      {/* Pagination */}
      {showAll && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mb-6">
          <PaginationButton onClick={() => handlePageChange(1)} disabled={currentPage === 1} text="First" />
          <PaginationButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} text="Previous" />
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;
            return (
              <PaginationButton
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                text={pageNum}
                active={currentPage === pageNum}
              />
            );
          })}
          <PaginationButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} text="Next" />
          <PaginationButton onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} text="Last" />
        </div>
      )}

      

      {/* View Modal */}
      {showModal && selectedAppointment && (
  <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h3 className="text-2xl font-bold mb-4 text-[#028478]">Appointment Details</h3>
      <div className="space-y-2 text-gray-800">
        <DetailRow label="Pet Type" value={selectedAppointment.pet_type} />
        <DetailRow label="Owner ID" value={selectedAppointment.owner_id} />
        <DetailRow
          label="Appointment Date & Time"
          value={`${new Date(selectedAppointment.appointment_date).toLocaleDateString()} at ${selectedAppointment.appointment_time}`}
        />
        <DetailRow label="Reason" value={selectedAppointment.reason} />
        <DetailRow
          label="Status"
          value={
            <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusClass(selectedAppointment.status)}`}>
              {selectedAppointment.status}
            </span>
          }
        />
        <DetailRow
          label="Additional Note"
          value={selectedAppointment.additional_note || 'No additional notes available.'}
        />
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={closeModal}
          className="bg-[#028478] text-white px-4 py-2 rounded hover:bg-[#046a5b]"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
    <p className="text-lg font-medium text-gray-900">{title}</p>
    <p className="text-3xl font-bold text-[#028478]">{value}</p>
  </div>
);

const PaginationButton = ({ onClick, disabled, text, active }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1 rounded-md ${
      active ? 'bg-[#046a5b]' : 'bg-[#028478]'
    } text-white disabled:bg-gray-300`}
  >
    {text}
  </button>
);

export default Appointments;

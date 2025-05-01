import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, Pencil, XCircle } from 'lucide-react';


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

  const handleCancel = async (appointmentId) => {
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


  const handleEdit = async (appointmentId) => {
    const confirmCancel = window.confirm("Are you sure you want to Complete this appointment?");
    if (!confirmCancel) return;
  
    try {
      await axios.put(`http://localhost:3001/api/assistantdoctor/${appointmentId}`, {
        status: 'Completed'
      });
  
      const updatedAppointments = appointments.map((a) =>
        a.appointment_id === appointmentId ? { ...a, status: 'Completed' } : a
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
              {['Appointment  ID', 'Owner Name', 'Date & Time', 'Reason', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.appointment_id}>
                <td className="px-6 py-4 text-sm text-gray-900">{appointment.appointment_id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{appointment.Owner_name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{appointment.reason}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium flex gap-3 items-center">
                    <button 
                      onClick={() => handleView(appointment)} 
                      className="flex items-center text-[#028478] hover:text-[#71C9CE]">
                      <Eye className="w-4 h-4 mr-1" />  
                    </button>

                    {appointment.status.toLowerCase() !== 'cancelled' &&
                    appointment.status.toLowerCase() !== 'completed' && (
                      <>
                        <button 
                          onClick={() => handleEdit(appointment.appointment_id)} 
                          className="flex items-center text-[#028478] hover:text-[#71C9CE]"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          
                        </button>
                        <button 
                          onClick={() => handleCancel(appointment.appointment_id)} 
                          className="flex items-center text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          
                        </button>
                      </>
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
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
  <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
    <h3 className="text-2xl font-semibold text-[#028478] mb-6 text-center">
      Appointment Id: #{selectedAppointment.appointment_id}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-800">
      <DetailRow label="Pet Name" value={selectedAppointment.Pet_name} />
      <DetailRow label="Owner Name" value={selectedAppointment.Owner_name} />
      <DetailRow label="Address" value={selectedAppointment.Owner_address} />
      <DetailRow label="Phone Number" value={selectedAppointment.Phone_number} />
      <DetailRow label="Email" value={selectedAppointment.E_mail} />
      <DetailRow
        label="Date & Time"
        value={`${new Date(selectedAppointment.appointment_date).toLocaleDateString()} at ${selectedAppointment.appointment_time}`}
      />
      <DetailRow label="Reason" value={selectedAppointment.reason} />
      <DetailRow
        label="Status"
        value={
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusClass(
              selectedAppointment.status
            )}`}
          >
            {selectedAppointment.status}
          </span>
        }
      />
      <div className="sm:col-span-2">
        <DetailRow
          label="Additional Note"
          value={
            selectedAppointment.additional_note || 'No additional notes available.'
          }
        />
      </div>
    </div>
    <div className="flex justify-end mt-8">
      <button
        onClick={closeModal}
        className="bg-[#028478] text-white px-5 py-2 rounded-md hover:bg-[#046a5b] transition"
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

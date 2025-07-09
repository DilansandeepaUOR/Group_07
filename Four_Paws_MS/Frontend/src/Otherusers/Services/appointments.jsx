import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, Pencil, XCircle, Check } from 'lucide-react';
import ConfirmDialog from '../../Components/ui/ConfirmDialog';
import RefreshButton from '../../Components/ui/RefreshButton';


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
  const [confirmDialog, setConfirmDialog] = useState({ open: false, appointmentId: null });
  const [cancelDialog, setCancelDialog] = useState({ open: false, appointmentId: null });
  const pageLimit = 20;
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [searchTerm, setSearchTerm] = useState("");

  // Move fetchAppointments out of useEffect for refresh
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

  useEffect(() => {
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

  const handleCancel = (appointmentId) => {
    setCancelDialog({ open: true, appointmentId });
  };

  const handleConfirmCancel = async () => {
    const appointmentId = cancelDialog.appointmentId;
    setCancelDialog({ open: false, appointmentId: null });
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


  const handleEdit = (appointmentId) => {
    setConfirmDialog({ open: true, appointmentId });
  };

  const handleConfirmEdit = async () => {
    const appointmentId = confirmDialog.appointmentId;
    setConfirmDialog({ open: false, appointmentId: null });
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
  

  // Helper to format date and time as 'YYYY-MM-DD at hh:mm AM/PM'
  function formatDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    // Check if date is today
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    // Format time as hh:mm AM/PM
    let [hour, minute] = timeStr.split(':');
    let ampm = 'AM';
    hour = parseInt(hour, 10);
    if (hour >= 12) {
      ampm = 'PM';
      if (hour > 12) hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }
    const timeFormatted = `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
    if (isToday) {
      return `Today at ${timeFormatted}`;
    }
    // Format date as YYYY-MM-DD
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} at ${timeFormatted}`;
  }

  // Helper to robustly parse date and time for sorting
  function getDateTimeForSort(dateStr, timeStr) {
    if (!dateStr) return new Date(0); // fallback to epoch if missing
    // If time is missing, use 00:00
    const time = timeStr ? timeStr : '00:00';
    // Try to parse as ISO, fallback to Date constructor
    const isoString = `${dateStr}T${time.length === 5 ? time : time.slice(0,5)}`;
    const d = new Date(isoString);
    if (!isNaN(d)) return d;
    // fallback: try Date(dateStr + ' ' + time)
    return new Date(`${dateStr} ${time}`);
  }

  // Filter and sort appointments before rendering
  const filteredAppointments = appointments
    .filter((appointment) => {
      const term = searchTerm.toLowerCase();
      const matches =
        (appointment.Pet_name && appointment.Pet_name.toLowerCase().includes(term)) ||
        (appointment.Owner_name && appointment.Owner_name.toLowerCase().includes(term)) ||
        (appointment.Owner_address && appointment.Owner_address.toLowerCase().includes(term)) ||
        (appointment.appointment_id && appointment.appointment_id.toString().toLowerCase().includes(term));
      if (!matches) return false;
      if (filterStatus === 'all') return true;
      return appointment.status && appointment.status.toLowerCase() === filterStatus;
    })
    .sort((a, b) => {
      const dateA = getDateTimeForSort(a.appointment_date, a.appointment_time);
      const dateB = getDateTimeForSort(b.appointment_date, b.appointment_time);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search by pet, owner, address, or ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028478] mb-2 md:mb-0"
        />
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-end">
          <button
            onClick={toggleView}
            className="bg-[#028478] text-white px-4 py-2 rounded hover:bg-[#046a5b]"
          >
            {showAll ? "View Today's Appointments" : 'View All Appointments'}
          </button>
          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border rounded px-2 py-1 text-[#028478]"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {/* Refresh Button */}
          <RefreshButton onClick={fetchAppointments} />
        </div>
      </div>

      <h2 className='text-xl font-semibold text-[#028478] pb-5'>{showAll ? "All Appointments" : "Today's Appointments"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Appointments" value={total} />
        <StatCard title="Completed" value={completed} />
        <StatCard title="Scheduled" value={scheduled} />
        <StatCard title="Cancelled" value={cancelled} />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Appointment  ID', 'Owner Name', 'Date & Time', 'Reason', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{appointment.appointment_id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{appointment.Owner_name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
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
                          <Check className="w-4 h-4 mr-1" />
                          
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
        {filteredAppointments.length === 0 && (
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
        value={formatDateTime(selectedAppointment.appointment_date, selectedAppointment.appointment_time)}
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

{/* Confirmation Dialog for Completing Appointment */}
<ConfirmDialog
  open={confirmDialog.open}
  title="Complete Appointment"
  description="Are you sure you want to mark this appointment as completed?"
  confirmLabel="Yes, Complete"
  cancelLabel="Cancel"
  onConfirm={handleConfirmEdit}
  onCancel={() => setConfirmDialog({ open: false, appointmentId: null })}
/>

{/* Confirmation Dialog for Cancelling Appointment */}
<ConfirmDialog
  open={cancelDialog.open}
  title="Cancel Appointment"
  description="Are you sure you want to cancel this appointment?"
  confirmLabel="Yes, Cancel"
  cancelLabel="No "
  onConfirm={handleConfirmCancel}
  type="cancel"
  onCancel={() => setCancelDialog({ open: false, appointmentId: null })}
/>

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

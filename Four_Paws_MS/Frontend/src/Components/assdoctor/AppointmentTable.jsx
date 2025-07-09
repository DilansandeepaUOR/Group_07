import React, { useState, useRef } from 'react';
import { Eye } from 'lucide-react';

const AssDoctorAppointmentTable = ({
  title,
  appointments,
  onViewDetails,
  getLocationDisplay,
  getStatusColor,
  isToday,
  updateMessage
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const tableRef = useRef(null);

  const filteredAppointments = appointments.filter(appt => {
    if (statusFilter === 'all') return true;
    return (appt.status || '').toLowerCase() === statusFilter;
  });

  const handleShowAll = () => {
    setStatusFilter('all');
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="space-y-8">
      {/* Success/Error Message */}
      {updateMessage && isToday &&(
        <div className={`p-3 rounded-md mb-2 text-center ${updateMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
          {updateMessage.text}
        </div>
      )}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#028478]">{title}</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="mr-2 text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {statusFilter !== 'all' && (
              <button
                onClick={handleShowAll}
                className="bg-[#028478] text-white px-4 py-2 rounded hover:bg-[#046a5b]"
              >
                Show All Appointments
              </button>
            )}
          </div>
        </div>
        <div ref={tableRef} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isToday ? 'Date & Time' : 'Date & Time'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(filteredAppointments) && filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment?.id || Math.random()} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{appointment?.id || 'Unnamed Pet'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment?.created_at
                              ? new Date(appointment.created_at).toISOString().slice(0, 10)
                              : 'Unnamed Pet'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment?.Owner_name || 'Not specified'}</div>
                        <div className="text-sm text-gray-500">{appointment?.Phone_number || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      {appointment?.date && appointment?.time ? (
                            <>
                              <div className="text-sm text-gray-900">
                                {new Date(appointment.date).toISOString().slice(0, 10)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(`1970-01-01T${appointment.time}`).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500">Date/Time not specified</div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs">{getLocationDisplay(appointment)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment?.status)}`}>
                          {appointment?.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => appointment?.id && onViewDetails(appointment.id)}
                          className="text-[#028478] hover:text-[#026e64] transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No appointments for {isToday ? 'today' : 'upcoming'}
                    </td>
                  </tr>
                )}
              </tbody>
              {/* Summary row for total appointments */}
              <tfoot>
                <tr>
                  <td colSpan="7" className="px-6 py-3 text-right text-sm text-gray-600 bg-gray-50">
                    Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssDoctorAppointmentTable; 
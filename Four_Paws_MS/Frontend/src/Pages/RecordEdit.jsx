import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaCalendarAlt } from 'react-icons/fa';

const RecordEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    surgery: '',
    vaccination: '',
    other: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dateError, setDateError] = useState(''); // New state for date validation error

  // Fetch record data when component mounts
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/full-record/${id}`);
        setRecord(response.data);
        setFormData({
          date: response.data.date.split('T')[0], // Format date for input
          surgery: response.data.surgery || '',
          vaccination: response.data.vaccination || '',
          other: response.data.other || ''
        });
      } catch (error) {
        console.error('Error fetching record:', error);
        setError('Failed to load record data');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      // Get today's date in YYYY-MM-DD format (timezone-safe)
      const today = new Date().toISOString().split('T')[0];
      
      if (value > today) {
        setDateError('Future dates are not allowed');
      } else {
        setDateError('');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Date validation (string comparison)
    const today = new Date().toISOString().split('T')[0];
    if (formData.date > today) {
    setDateError('Future dates are not allowed');
    return;
  }
    
    setLoading(true);
    
    try {
      const response = await axios.put(
        `http://localhost:3001/api/update-record/${id}`,
        formData
      );
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/recordsNew'), 1500); // Redirect after success
      }
    } catch (error) {
      console.error('Error updating record:', error);
      setError(error.response?.data?.error || 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading && !record) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/records')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Records
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Medical Record
        </h1>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <FaTimes size={24} />
        </button>
      </div>

      {record && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Pet Information</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">Pet: {record.Pet_name} ({record.Pet_type})</p>
            <p className="font-medium">Owner: {record.Owner_name}</p>
            <p>Email: {record.E_mail}</p>
            {record.Phone_number && <p>Phone: {record.Phone_number}</p>}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`pl-10 w-full p-2 border ${dateError ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                required
                max={new Date().toISOString().split('T')[0]} // Set max date to today
              />
            </div>
            {dateError && (
              <p className="mt-1 text-sm text-red-600">{dateError}</p>
            )}
          </div>
        </div>

        {/* Rest of the form fields remain the same */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Surgery Details
          </label>
          <textarea
            name="surgery"
            value={formData.surgery}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vaccination Details
          </label>
          <textarea
            name="vaccination"
            value={formData.vaccination}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Other Notes
          </label>
          <textarea
            name="other"
            value={formData.other}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="3"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Record updated successfully! Redirecting...
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || dateError}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <span className="animate-spin mr-2">↻</span>
            ) : (
              <FaSave className="mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordEdit;
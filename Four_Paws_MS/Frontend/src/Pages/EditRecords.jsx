import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTimes, FaSave, FaUndo } from 'react-icons/fa';
import logo from '../assets/logo.png';

const EditRecords = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState({
    owner_name: '',
    pet_name: '',
    date: '',
    surgery: '',
    vaccination: '',
    other: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validation functions
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`http://localhost:3001/record/${id}`);
        if (!response.ok) throw new Error('Failed to fetch record');
        const data = await response.json();
        setRecord({
          owner_name: data.owner_name || '',
          pet_name: data.pet_name || '',
          date: data.date || '',
          surgery: data.surgery || '',
          vaccination: data.vaccination || '',
          other: data.other || ''
        });
      } catch (error) {
        console.error('Error fetching record:', error);
        alert('Failed to load record');
        navigate('/records');
      }
    };
    fetchRecord();
  }, [id, navigate]);

  const validateForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const newErrors = {};

    if (!record.owner_name.trim()) {
      newErrors.owner_name = 'Owner name is required';
    } else if (!validateName(record.owner_name)) {
      newErrors.owner_name = 'Owner name must contain only English letters';
    }

    if (!record.pet_name.trim()) {
      newErrors.pet_name = 'Pet name is required';
    } else if (!validateName(record.pet_name)) {
      newErrors.pet_name = 'Pet name must contain only English letters';
    }

    if (!record.date) {
      newErrors.date = 'Date is required';
    } else if (record.date > today) {
      newErrors.date = 'Date cannot be in the future';
    }

    if (!record.surgery && !record.vaccination && !record.other) {
      newErrors.services = 'At least one service must be provided';
    } else {
      if (record.surgery && !record.surgery.trim()) {
        newErrors.surgery = 'Surgery details cannot be empty';
      }
      if (record.vaccination && !record.vaccination.trim()) {
        newErrors.vaccination = 'Vaccination details cannot be empty';
      }
      if (record.other && !record.other.trim()) {
        newErrors.other = 'Other service details cannot be empty';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/record/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
  
      if (!response.ok) throw new Error('Failed to update record');
      
      setSuccessMessage('Record updated successfully!');
      setTimeout(() => navigate('/records'), 1500);
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate('/records');

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] z-50 p-4 overflow-y-auto">
      <div className="absolute top-5 left-5 object-cover w-[200px]">
        <img src={logo} alt="logo" />
      </div>
      
      <div className="bg-gradient-to-b from-[#182020] to-[#394a46] p-8 rounded-lg shadow-2xl w-full max-w-7xl relative border-2 border-gray-800">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-3 right-3 text-white hover:text-gray-200 text-lg cursor-pointer"
        >
          <FaTimes size={22} />
        </button>
    
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-6 Poppins">
          Edit Record
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner Name */}
            <div className="space-y-2">
              <label className="block text-white">Owner Name:</label>
              <input
                type="text"
                value={record.owner_name}
                onChange={(e) => setRecord({...record, owner_name: e.target.value})}
                className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
                placeholder="e.g. John Doe"
              />
              {errors.owner_name && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <FaExclamationCircle /> {errors.owner_name}
                </p>
              )}
            </div>

            {/* Pet Name */}
            <div className="space-y-2">
              <label className="block text-white">Pet Name:</label>
              <input
                type="text"
                value={record.pet_name}
                onChange={(e) => setRecord({...record, pet_name: e.target.value})}
                className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
                placeholder="e.g. Bella"
              />
              {errors.pet_name && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <FaExclamationCircle /> {errors.pet_name}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="block text-white">Date:</label>
              <input
                type="date"
                value={record.date}
                onChange={(e) => setRecord({...record, date: e.target.value})}
                className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
              />
              {errors.date && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <FaExclamationCircle /> {errors.date}
                </p>
              )}
            </div>

            {/* Surgery */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-white">Surgery Details:</label>
              <input
                type="text"
                value={record.surgery}
                onChange={(e) => setRecord({...record, surgery: e.target.value})}
                className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
                placeholder="Enter surgery details"
              />
              {errors.surgery && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <FaExclamationCircle /> {errors.surgery}
                </p>
              )}
            </div>

            {/* Vaccination */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-white">Vaccination Details:</label>
              <input
                type="text"
                value={record.vaccination}
                onChange={(e) => setRecord({...record, vaccination: e.target.value})}
                className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
                placeholder="Enter vaccination details"
              />
              {errors.vaccination && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <FaExclamationCircle /> {errors.vaccination}
                </p>
              )}
            </div>

            {/* Other */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-white">Other Services:</label>
              <input
                type="text"
                value={record.other}
                onChange={(e) => setRecord({...record, other: e.target.value})}
                className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
                placeholder="Enter other service details"
              />
              {errors.other && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <FaExclamationCircle /> {errors.other}
                </p>
              )}
            </div>
          </div>

          {errors.services && (
            <div className="p-3 bg-red-700/20 text-red-400 rounded-lg flex items-center gap-2">
              <FaExclamationCircle /> {errors.services}
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`px-6 py-2 bg-gradient-to-r from-[#028478] to-[#5ba29c] text-white rounded-lg hover:from-[#5ba29c] hover:to-[#028478] transition-all font-bold flex items-center gap-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <FaSave /> {isLoading ? 'Updating...' : 'Update Record'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all font-bold flex items-center gap-2"
            >
              <FaUndo /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecords;
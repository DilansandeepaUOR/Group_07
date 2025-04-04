import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../Components/ui/PetServiceForm.css';

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

    // Owner name validation
    if (!record.owner_name.trim()) {
      newErrors.owner_name = 'Owner name is required';
    } else if (!validateName(record.owner_name)) {
      newErrors.owner_name = 'Owner name must contain only English letters';
    }

    // Pet name validation
    if (!record.pet_name.trim()) {
      newErrors.pet_name = 'Pet name is required';
    } else if (!validateName(record.pet_name)) {
      newErrors.pet_name = 'Pet name must contain only English letters';
    }

    // Date validation
    if (!record.date) {
      newErrors.date = 'Date is required';
    } else if (record.date > today) {
      newErrors.date = 'Date cannot be in the future';
    }

    // Service details validation
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
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_name: record.owner_name,
          pet_name: record.pet_name,
          date: record.date,
          surgery: record.surgery,
          vaccination: record.vaccination,
          other: record.other
        })
      });
  
      if (!response.ok) throw new Error('Failed to update record');
      
      // Show success message before navigating
      setSuccessMessage('Record updated successfully!');
      setTimeout(() => {
        navigate('/records');
      }, 1500); // Navigate after 1.5 seconds
      
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/records');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
  <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Pet Service Record</h2>
  {successMessage && (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
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
        <label className="block text-gray-700">Owner Name:</label>
        <input
          type="text"
          name="owner_name"
          value={record.owner_name}
          onChange={(e) => setRecord({...record, owner_name: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. John Doe"
        />
        {errors.owner_name && <p className="text-red-500 text-sm">{errors.owner_name}</p>}
      </div>

      {/* Pet Name */}
      <div className="space-y-2">
        <label className="block text-gray-700">Pet Name:</label>
        <input
          type="text"
          name="pet_name"
          value={record.pet_name}
          onChange={(e) => setRecord({...record, pet_name: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. Bella"
        />
        {errors.pet_name && <p className="text-red-500 text-sm">{errors.pet_name}</p>}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="block text-gray-700">Date:</label>
        <input
          type="date"
          name="date"
          value={record.date}
          onChange={(e) => setRecord({...record, date: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
      </div>

      {/* Surgery Details */}
      <div className="space-y-2 md:col-span-2">
        <label className="block text-gray-700">Surgery Details:</label>
        <input
          type="text"
          name="surgery"
          value={record.surgery}
          onChange={(e) => setRecord({...record, surgery: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter surgery details"
        />
        {errors.surgery && <p className="text-red-500 text-sm">{errors.surgery}</p>}
      </div>

      {/* Vaccination Details */}
      <div className="space-y-2 md:col-span-2">
        <label className="block text-gray-700">Vaccination Details:</label>
        <input
          type="text"
          name="vaccination"
          value={record.vaccination}
          onChange={(e) => setRecord({...record, vaccination: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter vaccination details"
        />
        {errors.vaccination && <p className="text-red-500 text-sm">{errors.vaccination}</p>}
      </div>

      {/* Other Services */}
      <div className="space-y-2 md:col-span-2">
        <label className="block text-gray-700">Other Services:</label>
        <input
          type="text"
          name="other"
          value={record.other}
          onChange={(e) => setRecord({...record, other: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter other service details"
        />
        {errors.other && <p className="text-red-500 text-sm">{errors.other}</p>}
      </div>
    </div>

    {errors.services && (
      <div className="p-3 bg-red-100 text-red-700 rounded">
        {errors.services}
      </div>
    )}

    <div className="flex space-x-4">
      <button 
        type="submit" 
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        disabled={isLoading}
      >
        {isLoading ? 'Updating...' : 'Update Record'}
      </button>
      <button 
        type="button" 
        onClick={handleCancel}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        disabled={isLoading}
      >
        Cancel
      </button>
    </div>
  </form>
</div>
  );
};

export default EditRecords;
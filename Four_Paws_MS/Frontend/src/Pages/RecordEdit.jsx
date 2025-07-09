import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';
import { FaUser, FaPaw, FaCalendarAlt, FaSave, FaTimes, FaCheck } from 'react-icons/fa';

const RecordEdit = ({ id, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    ownerId: '',
    petId: '',
    date: new Date().toISOString().split('T')[0],
    surgery: '',
    vaccineType: '',
    coreVaccine: '',
    lifestyleVaccine: '',
    otherVaccine: '',
    other: '',
    hasVaccination: false,
    hasSurgery: false,
    hasOtherNotes: false
  });
  const [pets, setPets] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/full-record/${id}`);
        const record = response.data;
        
        // Initialize form data
        const initialData = {
          ownerId: record.Owner_id,
          petId: record.Pet_id,
          date: record.date.split('T')[0],
          surgery: record.surgery || '',
          other: record.other || '',
          hasSurgery: !!record.surgery,
          hasOtherNotes: !!record.other,
          hasVaccination: !!record.vaccination_id
        };

        // Add vaccination data if exists
        if (record.vaccination_id) {
          initialData.vaccineType = record.vaccine_type;
          if (record.vaccine_type === 'core') {
            initialData.coreVaccine = record.vaccine_name;
          } else if (record.vaccine_type === 'lifestyle') {
            initialData.lifestyleVaccine = record.vaccine_name;
          }
          initialData.otherVaccine = record.other_vaccine || '';
        }

        // Fetch pets for this owner
        const petsRes = await axios.post('http://localhost:3001/api/get-pets', {
          ownerId: record.Owner_id
        });

        setPets(petsRes.data);
        setSelectedOwner({
          Owner_id: record.Owner_id,
          Owner_name: record.Owner_name,
          E_mail: record.E_mail,
          Phone_number: record.Phone_number
        });

        setFormData(initialData);

      } catch (error) {
        console.error('Error fetching record:', error);
        setErrors({
          fetch: error.response?.data?.error || 'Failed to load record data'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      const today = new Date().toISOString().split('T')[0];
      if (value > today) {
        setErrors(prev => ({ ...prev, date: 'Future dates are not allowed' }));
        return;
      } else {
        setErrors(prev => ({ ...prev, date: '' }));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle sections
  const toggleSection = (section) => {
    setFormData(prev => ({
      ...prev,
      [section]: !prev[section],
      // Clear the field when toggling off
      ...(section === 'hasSurgery' && !prev.hasSurgery ? { surgery: '' } : {}),
      ...(section === 'hasVaccination' && !prev.hasVaccination ? { 
        vaccineType: '',
        coreVaccine: '',
        lifestyleVaccine: '',
        otherVaccine: ''
      } : {}),
      ...(section === 'hasOtherNotes' && !prev.hasOtherNotes ? { other: '' } : {})
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];
    
    if (!formData.ownerId) newErrors.ownerId = 'Owner is required';
    if (!formData.petId) newErrors.petId = 'Pet is required';
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      newErrors.date = 'Invalid date format (YYYY-MM-DD required)';
    } else if (formData.date > today) {
      newErrors.date = 'Future dates are not allowed';
    }
    
    if (formData.hasVaccination) {
      if (!formData.vaccineType) {
        newErrors.vaccination = 'Please select a vaccine type';
      } else if (formData.vaccineType === 'core' && !formData.coreVaccine) {
        newErrors.vaccination = 'Please select a core vaccine';
      } else if (formData.vaccineType === 'lifestyle' && !formData.lifestyleVaccine) {
        newErrors.vaccination = 'Please select a lifestyle vaccine';
      }
    }
    
    if (!formData.hasSurgery && !formData.hasVaccination && !formData.hasOtherNotes) {
      newErrors.details = 'At least one detail field (Surgery, Vaccination, or Notes) is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const payload = {
        date: formData.date,
        surgery: formData.hasSurgery ? formData.surgery : null,
        other: formData.hasOtherNotes ? formData.other : null,
        petId: formData.petId
      };

      if (formData.hasVaccination && formData.vaccineType) {
        payload.vaccineType = formData.vaccineType;
        payload.coreVaccine = formData.vaccineType === 'core' ? formData.coreVaccine : null;
        payload.lifestyleVaccine = formData.vaccineType === 'lifestyle' ? formData.lifestyleVaccine : null;
        payload.otherVaccine = formData.otherVaccine || null;
      }
      
      const response = await axios.put(`http://localhost:3001/api/update-record/${id}`, payload);
      
      if (response.data.success) {
        setSuccessMessage('Medical record updated successfully!');
        setTimeout(() => {
          if (onCancel) onCancel();
          else navigate('/docdashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error:', error.response?.data);
      setErrors({
        submit: error.response?.data?.details || 
               error.response?.data?.error || 
               'Failed to update record'
      });
    } finally {
      setSubmitLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="text-red-500 mb-4">{errors.fetch}</div>
        <button
          onClick={onCancel || (() => navigate('/docdashboard'))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Edit Medical Record</h1>
          <button
            onClick={onCancel || (() => navigate('/docdashboard'))}
            className="text-white hover:text-blue-200"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {successMessage && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-center mb-4">
              <FaCheck className="mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner Information (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUser className="inline mr-2" />
                Owner
              </label>
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-800">{selectedOwner?.Owner_name}</h4>
                <p className="text-sm text-gray-600">{selectedOwner?.E_mail}</p>
                <p className="text-sm text-gray-600">{selectedOwner?.Phone_number}</p>
              </div>
            </div>
  
            {/* Pet Information (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaPaw className="inline mr-2" />
                Pet
              </label>
              {formData.petId && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-800">
                    {pets.find(p => p.Pet_id == formData.petId)?.Pet_name || 'Unknown Pet'}
                  </h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {pets.find(p => p.Pet_id == formData.petId)?.Pet_type || 'Unknown Type'}
                  </p>
                </div>
              )}
            </div>
  
            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline mr-2" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`mt-1 block w-full pl-10 p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>
  
            {/* Medical Record Sections */}
            <div className="space-y-6">
              {/* Surgery Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="hasSurgery"
                    checked={formData.hasSurgery}
                    onChange={() => toggleSection('hasSurgery')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasSurgery" className="ml-2 block text-sm font-medium text-gray-700">
                    Surgery Details
                  </label>
                </div>
                
                {formData.hasSurgery && (
                  <textarea
                    name="surgery"
                    value={formData.surgery}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter surgery details"
                  />
                )}
              </div>
  
              {/* Vaccination Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="hasVaccination"
                    checked={formData.hasVaccination}
                    onChange={() => toggleSection('hasVaccination')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasVaccination" className="ml-2 block text-sm font-medium text-gray-700">
                    Vaccination Details
                  </label>
                </div>
                
                {formData.hasVaccination && (
                  <div className="space-y-4">
                    {/* Pet Age Display */}
                    {formData.petId && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                          Pet Age: {(() => {
                            const selectedPet = pets.find(p => p.Pet_id == formData.petId);
                            if (selectedPet && selectedPet.Pet_dob) {
                              const dob = new Date(selectedPet.Pet_dob);
                              const today = new Date();
                              const diffTime = Math.abs(today - dob);
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              
                              if (diffDays < 365) {
                                const weeks = Math.floor(diffDays / 7);
                                const remainingDays = diffDays % 7;
                                return `${weeks} week${weeks !== 1 ? 's' : ''}${
                                  remainingDays > 0 ? ` ${remainingDays} day${remainingDays !== 1 ? 's' : ''}` : ''
                                }`;
                              } else {
                                const years = Math.floor(diffDays / 365);
                                const remainingDays = diffDays % 365;
                                const months = Math.floor(remainingDays / 30);
                                return `${years} year${years !== 1 ? 's' : ''}${
                                  months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''
                                }`;
                              }
                            }
                            return 'Unknown (date of birth not set)';
                          })()}
                        </p>
                      </div>
                    )}
  
                    {/* Vaccine Type Selection */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Vaccine Type
                      </label>
                      <select
                        name="vaccineType"
                        value={formData.vaccineType || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select Vaccine Type</option>
                        <option value="core">Core Vaccines</option>
                        <option value="lifestyle">Lifestyle Vaccines</option>
                      </select>
                    </div>
  
                    {/* Core Vaccines Selection */}
                    {formData.vaccineType === 'core' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Core Vaccine
                        </label>
                        <select
                          name="coreVaccine"
                          value={formData.coreVaccine || ''}
                          onChange={handleChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="">Select Core Vaccine</option>
                          <option value="DA2PP">DA2PP*</option>
                          <option value="Leptospirosis">Leptospirosis</option>
                          <option value="Rabies">Rabies**</option>
                        </select>
                      </div>
                    )}
  
                    {/* Lifestyle Vaccines Selection */}
                    {formData.vaccineType === 'lifestyle' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Lifestyle Vaccine
                        </label>
                        <select
                          name="lifestyleVaccine"
                          value={formData.lifestyleVaccine || ''}
                          onChange={handleChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="">Select Lifestyle Vaccine</option>
                          <option value="Bordetella">Bordetella</option>
                          <option value="Parainfluenza">Parainfluenza</option>
                          <option value="Lyme">Lyme</option>
                          <option value="Canine Influenza">Canine Influenza</option>
                        </select>
                      </div>
                    )}
  
                    {/* Other Vaccine Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Other Vaccine (Optional)
                      </label>
                      <input
                        type="text"
                        name="otherVaccine"
                        value={formData.otherVaccine || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Enter other vaccine if not listed"
                      />
                    </div>
                  </div>
                )}
              </div>
  
              {/* Other Notes Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="hasOtherNotes"
                    checked={formData.hasOtherNotes}
                    onChange={() => toggleSection('hasOtherNotes')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasOtherNotes" className="ml-2 block text-sm font-medium text-gray-700">
                    Other Notes
                  </label>
                </div>
                
                {formData.hasOtherNotes && (
                  <textarea
                    name="other"
                    value={formData.other}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter any additional notes"
                  />
                )}
              </div>
            </div>
  
            {/* Combined error for detail fields */}
            {errors.details && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.details}
              </div>
            )}
  
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Update Medical Record
                  </>
                )}
              </button>
              {errors.submit && (
                <p className="mt-2 text-sm text-red-600 text-center">{errors.submit}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecordEdit;
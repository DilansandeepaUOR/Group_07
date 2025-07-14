import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPaw, FaCalendarAlt, FaSave, FaTimes, FaCheck, FaWeightHanging, FaChevronDown } from 'react-icons/fa';

const RecordEdit = ({ id, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    ownerId: '',
    petId: '',
    date: '',
    weight: '',
    surgery: '',
    vaccineType: '',
    coreVaccine: '',
    lifestyleVaccine: '',
    otherVaccine: '',
    other: '',
  });

  const [activeSections, setActiveSections] = useState({
    surgery: false,
    vaccination: false,
    otherNotes: false,
  });

  const [pets, setPets] =useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const getTodayDateString = () => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - timezoneOffset);
    return localDate.toISOString().split('T')[0];
  };

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
          weight: record.weight || '',
          surgery: record.surgery || '',
          other: record.other || '',
        };

        // Initialize active sections based on existing data
        setActiveSections({
          surgery: !!record.surgery,
          vaccination: !!record.vaccination_id,
          otherNotes: !!record.other,
        });

        // Add vaccination data if it exists
        if (record.vaccination_id) {
          initialData.vaccineType = record.vaccine_type || '';
          if (record.vaccine_type === 'core') {
            initialData.coreVaccine = record.vaccine_name || '';
          } else if (record.vaccine_type === 'lifestyle') {
            initialData.lifestyleVaccine = record.vaccine_name || '';
          }
          initialData.otherVaccine = record.other_vaccine || '';
        }
        
        // Fetch pets for this owner to display correct info
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
    let newErrors = { ...errors };

    if (name === 'date') {
      if (value > getTodayDateString()) {
        newErrors.date = 'Future dates are not allowed';
      } else {
        delete newErrors.date;
      }
    }
    
    if (name === "weight") {
        if (value && parseFloat(value) <= 0) {
            newErrors.weight = 'Weight must be greater than 0';
        } else if (value.includes('.') && value.split('.')[1].length > 2) {
            newErrors.weight = 'Weight cannot exceed 2 decimal places';
        } else {
            delete newErrors.weight;
        }
    }
    
    setErrors(newErrors);
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Toggle sections and clear data if section is closed
  const toggleSection = (section) => {
    const isClosing = activeSections[section];
    setActiveSections(prev => ({ ...prev, [section]: !prev[section] }));
    
    if (isClosing) {
        if (section === 'surgery') setFormData(prev => ({ ...prev, surgery: '' }));
        if (section === 'vaccination') setFormData(prev => ({ ...prev, vaccineType: '', coreVaccine: '', lifestyleVaccine: '', otherVaccine: '' }));
        if (section === 'otherNotes') setFormData(prev => ({ ...prev, other: '' }));
    }
  };


  // Form validation
  const validateForm = () => {
    const newErrors = {};
    const today = getTodayDateString();
    
    if (!formData.ownerId) newErrors.ownerId = 'Owner is required';
    if (!formData.petId) newErrors.petId = 'Pet is required';
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (formData.date > today) {
      newErrors.date = 'Future dates are not allowed';
    }

    if (!formData.weight) {
        newErrors.weight = 'Weight is required';
    } else if (parseFloat(formData.weight) <= 0) {
        newErrors.weight = 'Weight must be a positive number';
    } else if (String(formData.weight).includes('.') && String(formData.weight).split('.')[1].length > 2) {
        newErrors.weight = 'Weight cannot have more than 2 decimal places';
    }
    
    if (activeSections.vaccination) {
      if (!formData.vaccineType) {
        newErrors.vaccination = 'Please select a vaccine type';
      } else if (formData.vaccineType === 'core' && !formData.coreVaccine) {
        newErrors.vaccination = 'Please select a core vaccine';
      } else if (formData.vaccineType === 'lifestyle' && !formData.lifestyleVaccine) {
        newErrors.vaccination = 'Please select a lifestyle vaccine';
      }
    }
    
    if (!activeSections.surgery && !activeSections.vaccination && !activeSections.otherNotes) {
      newErrors.details = 'At least one detail section (Surgery, Vaccination, or Notes) is required';
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
        weight: formData.weight,
        surgery: activeSections.surgery ? formData.surgery : null,
        other: activeSections.otherNotes ? formData.other : null,
        petId: formData.petId,
        vaccineType: null,
        coreVaccine: null,
        lifestyleVaccine: null,
        otherVaccine: null,
      };

      if (activeSections.vaccination && formData.vaccineType) {
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
        submit: error.response?.data?.details || error.response?.data?.error || 'Failed to update record'
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
          Back
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
        
        <div className="p-8">
          {successMessage && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-center mb-6">
              <FaCheck className="mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Owner Information (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2" /> Owner
                  </label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-gray-800">{selectedOwner?.Owner_name}</h4>
                    <p className="text-sm text-gray-600">{selectedOwner?.E_mail}</p>
                    <p className="text-sm text-gray-600">{selectedOwner?.Phone_number}</p>
                  </div>
                </div>
      
                {/* Pet Information (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPaw className="inline mr-2" /> Pet
                  </label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-gray-800">
                      {pets.find(p => p.Pet_id == formData.petId)?.Pet_name || 'Unknown Pet'}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {pets.find(p => p.Pet_id == formData.petId)?.Pet_type || 'Unknown Type'}
                    </p>
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Date Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><FaCalendarAlt className="inline mr-2" /> Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} max={getTodayDateString()}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>
    
                {/* Weight Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"><FaWeightHanging className="inline mr-2" /> Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="0" step="0.01"
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.weight ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
                </div>
            </div>
  
            {/* Medical Record Sections */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              {/* Surgery Section */}
              <div className="border rounded-md">
                  <div className="flex justify-between items-center cursor-pointer p-4" onClick={() => toggleSection('surgery')}>
                    <h3 className="text-lg font-medium text-gray-800">Surgery Details</h3>
                    <FaChevronDown className={`transform transition-transform ${activeSections.surgery ? 'rotate-180' : ''}`} />
                  </div>
                  {activeSections.surgery && (
                    <div className="p-4 border-t border-gray-200">
                      <textarea name="surgery" value={formData.surgery} onChange={handleChange} rows={3}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter surgery details"
                      />
                    </div>
                  )}
              </div>
  
              {/* Vaccination Section */}
              <div className="border rounded-md">
                  <div className="flex justify-between items-center cursor-pointer p-4" onClick={() => toggleSection('vaccination')}>
                    <h3 className="text-lg font-medium text-gray-800">Vaccination Details</h3>
                    <FaChevronDown className={`transform transition-transform ${activeSections.vaccination ? 'rotate-180' : ''}`} />
                  </div>
                  {activeSections.vaccination && (
                     <div className="space-y-4 p-4 border-t border-gray-200">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Vaccine Type</label>
                          <select name="vaccineType" value={formData.vaccineType} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                            <option value="">Select Vaccine Type</option>
                            <option value="core">Core Vaccines</option>
                            <option value="lifestyle">Lifestyle Vaccines</option>
                          </select>
                        </div>
                        {formData.vaccineType === 'core' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Core Vaccine</label>
                            <select name="coreVaccine" value={formData.coreVaccine} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                              <option value="">Select Core Vaccine</option>
                              <option value="DA2PP">DA2PP*</option>
                              <option value="Leptospirosis">Leptospirosis</option>
                              <option value="Rabies">Rabies**</option>
                            </select>
                          </div>
                        )}
                        {formData.vaccineType === 'lifestyle' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Lifestyle Vaccine</label>
                            <select name="lifestyleVaccine" value={formData.lifestyleVaccine} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                              <option value="">Select Lifestyle Vaccine</option>
                              <option value="Bordetella">Bordetella</option>
                              <option value="Parainfluenza">Parainfluenza</option>
                              <option value="Lyme">Lyme</option>
                              <option value="Canine Influenza">Canine Influenza</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Other Vaccine (Optional)</label>
                          <input type="text" name="otherVaccine" value={formData.otherVaccine} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Enter other vaccine if not listed" />
                        </div>
                        {errors.vaccination && <p className="mt-1 text-sm text-red-600">{errors.vaccination}</p>}
                     </div>
                  )}
              </div>
  
              {/* Other Notes Section */}
              <div className="border rounded-md">
                  <div className="flex justify-between items-center cursor-pointer p-4" onClick={() => toggleSection('otherNotes')}>
                    <h3 className="text-lg font-medium text-gray-800">Other Notes</h3>
                    <FaChevronDown className={`transform transition-transform ${activeSections.otherNotes ? 'rotate-180' : ''}`} />
                  </div>
                  {activeSections.otherNotes && (
                    <div className="p-4 border-t border-gray-200">
                      <textarea name="other" value={formData.other} onChange={handleChange} rows={3}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter any additional notes"
                      />
                    </div>
                  )}
              </div>
            </div>
  
            {/* Combined error for detail fields */}
            {errors.details && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.details}
              </div>
            )}
  
            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row-reverse gap-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full sm:w-auto flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
              <button type="button" onClick={onCancel || (() => navigate('/docdashboard'))}
                className="cursor-pointer w-full sm:w-auto flex justify-center items-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
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
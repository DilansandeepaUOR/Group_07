import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPaw, FaCalendarAlt, FaPlus, FaTimes, FaSearch, FaCheck } from 'react-icons/fa';

const RecordNew = () => {
  const navigate = useNavigate();
  const [allOwners, setAllOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState({
    owners: true,
    pets: false
  });
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


  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [petSearchTerm, setPetSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState({
    loading: false,
    error: null,
    noResults: false
  });
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message

  const getTodayDateString = () => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - timezoneOffset);
    return localDate.toISOString().split('T')[0];
  };

  // Fetch all owners on component mount
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/all-owners');
        setAllOwners(response.data);
        setFilteredOwners(response.data);
      } catch (error) {
        console.error('Error fetching owners:', error);
      } finally {
        setLoading(prev => ({ ...prev, owners: false }));
      }
    };
    
    fetchOwners();
  }, []);
  // Filter owners based on search term
useEffect(() => {
  if (ownerSearchTerm) {
    const search = async () => {
      setSearchStatus(prev => ({ ...prev, loading: true, error: null, noResults: false }));
      
      try {
        const response = await axios.post('http://localhost:3001/api/search-owners-new', {
          searchTerm: ownerSearchTerm
        });
        
        if (response.data.success) {
          setFilteredOwners(response.data.data);
          setSearchStatus(prev => ({ ...prev, loading: false, noResults: false }));
        } else {
          setFilteredOwners([]);
          setSearchStatus(prev => ({ 
            ...prev, 
            loading: false, 
            noResults: true,
            error: response.data.message || 'No results found'
          }));
        }
      } catch (error) {
        console.error('Error searching owners:', error);
        setFilteredOwners([]);
        setSearchStatus(prev => ({ 
          ...prev, 
          loading: false, 
          noResults: true,
          error: error.response?.data?.message || 'Error searching owners'
        }));
      }
    };
    
    const timer = setTimeout(() => {
      search();
    }, 300);
    
    return () => clearTimeout(timer);
  } else {
    setFilteredOwners(allOwners);
    setSearchStatus(prev => ({ ...prev, loading: false, error: null, noResults: false }));
  }
}, [ownerSearchTerm, allOwners]);

  // Fetch pets when owner is selected
  useEffect(() => {
    if (formData.ownerId) {
      const fetchPets = async () => {
        setLoading(prev => ({ ...prev, pets: true }));
        try {
          const response = await axios.post('http://localhost:3001/api/get-pets', {
            ownerId: formData.ownerId
          });
          setPets(response.data);
          setFormData(prev => ({ ...prev, petId: '' }));
        } catch (error) {
          console.error('Error fetching pets:', error);
        } finally {
          setLoading(prev => ({ ...prev, pets: false }));
        }
      };
      
      fetchPets();
      
      // Set the selected owner details
      const owner = allOwners.find(o => o.Owner_id == formData.ownerId);
      setSelectedOwner(owner);
    }
  }, [formData.ownerId, allOwners]);

  // Filter pets based on search term
  const filteredPets = pets.filter(pet => 
    pet.Pet_name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
    pet.Pet_type.toLowerCase().includes(petSearchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      const today = getTodayDateString();
      
      if (value > today) {
        setErrors(prev => ({
          ...prev,
          date: 'Future dates are not allowed'
        }));
        return;
      } else {
        setErrors(prev => ({
          ...prev,
          date: ''
        }));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const today = getTodayDateString();
    
    // Required fields validation
    if (!formData.ownerId) newErrors.ownerId = 'Owner is required';
    if (!formData.petId) newErrors.petId = 'Pet is required';
    
    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      newErrors.date = 'Invalid date format (YYYY-MM-DD required)';
    } else if (formData.date > today) {
      newErrors.date = 'Future dates are not allowed';
    }
    
    // Vaccination validation only if checkbox is checked
    if (formData.hasVaccination) {
      if (!formData.vaccineType) {
        newErrors.vaccination = 'Please select a vaccine type';
      } else if (formData.vaccineType === 'core' && !formData.coreVaccine) {
        newErrors.vaccination = 'Please select a core vaccine';
      } else if (formData.vaccineType === 'lifestyle' && !formData.lifestyleVaccine) {
        newErrors.vaccination = 'Please select a lifestyle vaccine';
      }
    }
    
    // At least one detail field validation
    if (!formData.hasSurgery && !formData.hasVaccination && !formData.hasOtherNotes) {
      newErrors.details = 'At least one detail field (Surgery, Vaccination, or Notes) is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

//handleSubmit function to handle the response
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  setSubmitLoading(true);
  setErrors({});
  setSuccessMessage('');
  
  try {
    // Base payload without vaccination data
    const payload = {
      ownerId: formData.ownerId,
      petId: formData.petId,
      date: formData.date,
      surgery: formData.hasSurgery ? formData.surgery : null,
      other: formData.hasOtherNotes ? formData.other : null
    };

    // Only add vaccination data if vaccination checkbox is checked AND vaccine type is selected
    if (formData.hasVaccination && formData.vaccineType) {
      payload.vaccineType = formData.vaccineType;
      payload.coreVaccine = formData.vaccineType === 'core' ? formData.coreVaccine : null;
      payload.lifestyleVaccine = formData.vaccineType === 'lifestyle' ? formData.lifestyleVaccine : null;
      payload.otherVaccine = formData.otherVaccine || null;
    }
    
    const response = await axios.post('http://localhost:3001/api/records', payload);
    
    if (response.data.success) {
      setSuccessMessage('Medical record added successfully!');
      // Reset form
      setFormData({
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
      setSelectedOwner(null);
      setOwnerSearchTerm('');
      setPetSearchTerm('');
    }
  } catch (error) {
    console.error('Error:', error.response?.data);
    setErrors({
      submit: error.response?.data?.details || 
             error.response?.data?.error || 
             'Failed to create record'
    });
  } finally {
    setSubmitLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Add New Medical Record</h1>
          <button
            onClick={() => navigate('/docdashboard')}
            className="text-white hover:text-blue-200"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
              <FaCheck className="mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUser className="inline mr-2" />
                Owner
              </label>
              
              {/* Owner Search Input */}
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search owners..."
                  value={ownerSearchTerm}
                  onChange={(e) => setOwnerSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Search status messages */}
              {searchStatus.loading && (
                <p className="mt-2 text-sm text-gray-600">Searching...</p>
              )}
              {searchStatus.noResults && !searchStatus.loading && (
                <p className="mt-2 text-sm text-red-600">{searchStatus.error}</p>
              )}
              
              {/* Owner Dropdown */}
              {!searchStatus.loading && !searchStatus.noResults && filteredOwners.length > 0 && (
                <>
                  <select
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleChange}
                    className={`mt-2 block w-full pl-10 p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      errors.ownerId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading.owners}
                  >
                    <option value="">Select Owner</option>
                    {filteredOwners.map(owner => {
                      const address = owner.Owner_address || 'No address provided';
                      return (
                        <option 
                          key={owner.Owner_id} 
                          value={owner.Owner_id} 
                          title={`${owner.Owner_name} - ${address}`}
                        >
                          {owner.Owner_name} - {address.length > 30 
                            ? `${address.substring(0, 30)}...` 
                            : address}
                        </option>
                      );
                    })}
                  </select>
                  {errors.ownerId && (
                    <p className="mt-1 text-sm text-red-600">{errors.ownerId}</p>
                  )}
                </>
              )}
              
              {/* Selected Owner Info */}
              {selectedOwner && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-800">{selectedOwner.Owner_name}</h4>
                  <p className="text-sm text-gray-600">{selectedOwner.Owner_address}</p>
                </div>
              )}
            </div>
  
            {/* Pet Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaPaw className="inline mr-2" />
                Pet
              </label>
              
              {/* Pet Search Input (only shown when owner is selected) */}
              {formData.ownerId && (
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search pets..."
                    value={petSearchTerm}
                    onChange={(e) => setPetSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading.pets}
                  />
                </div>
              )}
              
              {/* Pet Dropdown */}
              <select
                name="petId"
                value={formData.petId}
                onChange={handleChange}
                className={`mt-2 block w-full pl-10 p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.petId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading.pets || !formData.ownerId}
              >
                <option value="">{loading.pets ? 'Loading pets...' : 'Select Pet'}</option>
                {filteredPets.map(pet => (
                  <option key={pet.Pet_id} value={pet.Pet_id}>
                    {pet.Pet_name} ({pet.Pet_type})
                  </option>
                ))}
              </select>
              {errors.petId && (
                <p className="mt-1 text-sm text-red-600">{errors.petId}</p>
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
                max={getTodayDateString()}
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
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        hasSurgery: e.target.checked,
                        surgery: e.target.checked ? formData.surgery : ''
                      });
                    }}
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
                    // In the vaccination section checkbox
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        hasVaccination: e.target.checked,
                        vaccineType: e.target.checked ? formData.vaccineType : '',
                        coreVaccine: e.target.checked ? formData.coreVaccine : '',
                        lifestyleVaccine: e.target.checked ? formData.lifestyleVaccine : '',
                        otherVaccine: e.target.checked ? formData.otherVaccine : ''
                      });
                    }}
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
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        hasOtherNotes: e.target.checked,
                        other: e.target.checked ? formData.other : ''
                      });
                    }}
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
                    Processing...
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2" />
                    Add Medical Record
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

export default RecordNew;
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaPaw, FaCalendarAlt, FaPlus, FaSearch, FaCheck, FaWeightHanging, FaChevronDown } from 'react-icons/fa';

// --- NEW HELPER FUNCTION ---
// This function contains the logic to map a vaccine name and its count to the correct v_code.
const getVCode = (vaccineName, count) => {
  const rules = {
    'DA2PP': ['d1', 'd2', 'd3', 'dA'],
    'Leptospirosis': ['l1', 'l2', 'lA'],
    'Rabies': ['r1', 'rA'],
    'Bordetella': ['b1', 'bA'],
    'Lyme': ['y1', 'y2', 'yA'],
    'Parainfluenza': ['p1'],
    'Canine Influenza': ['c1', 'c2']
  };

  const sequence = rules[vaccineName];
  if (!sequence) return null; // Return null if no rule exists for the vaccine

  // If the pet has had this vaccine more times than we have codes, use the last code in the sequence
  if (count >= sequence.length) {
    return sequence[sequence.length - 1];
  }

  return sequence[count];
};


const RecordNew = ({ onSuccess }) => {
  const [allOwners, setAllOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState({
    owners: true,
    pets: false,
    v_code: false, // --- NEW: Add loading state for v_code calculation
  });
  
  const [formData, setFormData] = useState({
    ownerId: '',
    petId: '',
    date: new Date().toISOString().split('T')[0],
    weight: '',
    surgery: '',
    vaccineType: '',
    coreVaccine: '',
    lifestyleVaccine: '',
    otherVaccine: '',
    other: '',
    v_code: null, // --- NEW: Add v_code to your form data state
  });

  const [activeSections, setActiveSections] = useState({
    surgery: false,
    vaccination: false,
    otherNotes: false,
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
  const [successMessage, setSuccessMessage] = useState('');

  const getTodayDateString = () => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - timezoneOffset);
    return localDate.toISOString().split('T')[0];
  };

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
      const timer = setTimeout(() => search(), 300);
      return () => clearTimeout(timer);
    } else {
      setFilteredOwners(allOwners);
      setSearchStatus({ loading: false, error: null, noResults: false });
    }
  }, [ownerSearchTerm, allOwners]);

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
          setPetSearchTerm('');
        } catch (error) {
          console.error('Error fetching pets:', error);
        } finally {
          setLoading(prev => ({ ...prev, pets: false }));
        }
      };
      fetchPets();
      const owner = allOwners.find(o => o.Owner_id == formData.ownerId);
      setSelectedOwner(owner);
    } else {
      setPets([]);
      setFormData(prev => ({...prev, petId: ''}));
      setSelectedOwner(null);
    }
  }, [formData.ownerId, allOwners]);

  // --- NEW useEffect HOOK ---
  // This effect runs whenever the selected pet or vaccine changes.
  // It calls the new backend endpoint to get the vaccination count and sets the v_code.
  useEffect(() => {
    const fetchVaccineCountAndSetCode = async () => {
      // Determine which vaccine is currently selected
      const selectedVaccine = formData.coreVaccine || formData.lifestyleVaccine;

      // Only proceed if a pet and a vaccine are selected inside the active vaccination section
      if (formData.petId && activeSections.vaccination && selectedVaccine) {
        setLoading(prev => ({ ...prev, v_code: true }));
        try {
          const response = await axios.post('http://localhost:3001/api/vaccine-history-count', {
            petId: formData.petId,
            vaccineName: selectedVaccine,
          });

          if (response.data.success) {
            const count = response.data.count;
            const calculatedVCode = getVCode(selectedVaccine, count);
            setFormData(prev => ({ ...prev, v_code: calculatedVCode }));
          }
        } catch (error) {
          console.error('Error fetching vaccine count:', error);
          // Optionally, set an error message for the user
          setErrors(prev => ({ ...prev, vaccination: "Could not verify vaccine history." }));
        } finally {
          setLoading(prev => ({ ...prev, v_code: false }));
        }
      } else {
        // Reset v_code if no pet/vaccine is selected or section is inactive
        if (formData.v_code !== null) {
          setFormData(prev => ({ ...prev, v_code: null }));
        }
      }
    };

    fetchVaccineCountAndSetCode();
  }, [formData.petId, formData.coreVaccine, formData.lifestyleVaccine, activeSections.vaccination]);


  const filteredPets = pets.filter(pet =>
    pet.Pet_name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
    pet.Pet_type.toLowerCase().includes(petSearchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    // When vaccine type (core/lifestyle) is changed, reset the specific vaccine choice
    if (name === 'vaccineType') {
        setFormData(prev => ({
            ...prev,
            coreVaccine: '',
            lifestyleVaccine: '',
            v_code: null,
        }));
    }

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

  const toggleSection = (section) => {
    setActiveSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const validateForm = () => {
    const newErrors = {};
    const today = getTodayDateString();
    
    if (!formData.ownerId) newErrors.ownerId = 'Owner is required';
    if (!formData.petId) newErrors.petId = 'Pet is required';
    if (!formData.date) newErrors.date = 'Date is required';
    else if (formData.date > today) newErrors.date = 'Future dates are not allowed';
    
    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Weight must be a positive number';
    } else if (String(formData.weight).includes('.') && String(formData.weight).split('.')[1].length > 2) {
      newErrors.weight = 'Weight cannot have more than 2 decimal places';
    }

    if (!activeSections.surgery && !activeSections.vaccination && !activeSections.otherNotes) {
      newErrors.details = 'At least one detail section (Surgery, Vaccination, or Other Notes) must be added';
    } else {
        if (activeSections.surgery && !formData.surgery) newErrors.surgery = "Surgery details are required";
        if (activeSections.otherNotes && !formData.other) newErrors.other = "Other notes are required";

        if (activeSections.vaccination) {
          const selectedVaccine = formData.coreVaccine || formData.lifestyleVaccine;
          if (!formData.vaccineType) newErrors.vaccination = 'Please select a vaccine type';
          else if (!selectedVaccine) newErrors.vaccination = 'Please select a specific vaccine';
          
          // --- NEW: Validate that v_code has been calculated ---
          else if (!formData.v_code) newErrors.vaccination = "Verifying vaccine history... please wait.";
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isFormIncomplete = () => {
    if (!formData.ownerId || !formData.petId || !formData.date || !formData.weight) return true;
    if (parseFloat(formData.weight) <= 0 || (String(formData.weight).includes('.') && String(formData.weight).split('.')[1].length > 2)) return true;
    
    if (!activeSections.surgery && !activeSections.vaccination && !activeSections.otherNotes) return true;

    if (activeSections.surgery && !formData.surgery) return true;
    if (activeSections.otherNotes && !formData.other) return true;
    if (activeSections.vaccination) {
        if (!formData.vaccineType || !(formData.coreVaccine || formData.lifestyleVaccine) || !formData.v_code) {
          return true;
        }
    }
    
    return false;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  setSubmitLoading(true);
  setErrors({});
  setSuccessMessage('');
  
  try {
    // --- MODIFIED: Include v_code in the payload ---
    const payload = {
      ownerId: formData.ownerId,
      petId: formData.petId,
      date: formData.date,
      weight: formData.weight,
      surgery: activeSections.surgery ? formData.surgery : null,
      other: activeSections.otherNotes ? formData.other : null,
      vaccineType: null,
      vaccineName: null, // Sending one field for the vaccine name
      otherVaccine: null,
      v_code: null,      // This will hold our special code
    };

    if (activeSections.vaccination && formData.vaccineType) {
      payload.vaccineType = formData.vaccineType;
      payload.vaccineName = formData.coreVaccine || formData.lifestyleVaccine;
      payload.otherVaccine = formData.otherVaccine || null;
      payload.v_code = formData.v_code; // Add the calculated v_code to the payload
    }
    
    // Note: The backend endpoint /api/records must be updated to accept and save
    // `vaccineName` and `v_code` into your `vaccination` table.
    const response = await axios.post('http://localhost:3001/api/records', payload);
    
    if (response.data.success) {
      if (onSuccess) {
          onSuccess();
      }
      // --- MODIFIED: Reset v_code on success ---
      setFormData({
        ownerId: '', petId: '', date: getTodayDateString(), weight: '',
        surgery: '', vaccineType: '', coreVaccine: '', lifestyleVaccine: '',
        otherVaccine: '', other: '', v_code: null,
      });
      setActiveSections({ surgery: false, vaccination: false, otherNotes: false });
      setSelectedOwner(null);
      setOwnerSearchTerm('');
      setPetSearchTerm('');
      setErrors({});
    }
  } catch (error) {
    console.error('Error:', error.response?.data);
    setErrors({ submit: error.response?.data?.error || 'Failed to create record' });
  } finally {
    setSubmitLoading(false);
  }
};

const handleCancel = () => {
  // --- MODIFIED: Reset v_code on cancel ---
  setFormData({
    ownerId: '', petId: '', date: getTodayDateString(), weight: '',
    surgery: '', vaccineType: '', coreVaccine: '', lifestyleVaccine: '',
    otherVaccine: '', other: '', v_code: null,
  });
  setActiveSections({ surgery: false, vaccination: false, otherNotes: false });
  setOwnerSearchTerm("");
  setPetSearchTerm("");
  setErrors({});
  setSuccessMessage("");
};

return (
<div className="min-h-screen bg-gray-50">
    <div className="bg-white overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Add New Medical Record</h2>
          <p className="text-gray-500">Fill all the details below to create a new record.</p>
        </div>
        {successMessage && (
          <div className="p-4 mb-6 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <FaCheck className="mr-2 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Owner and Pet selection (no changes here) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" /> Owner
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input type="text" placeholder="Search owners..." value={ownerSearchTerm} onChange={(e) => setOwnerSearchTerm(e.target.value)}
                  className="cursor-text block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {searchStatus.loading && <p className="mt-2 text-sm text-gray-600">Searching...</p>}
              {searchStatus.noResults && !searchStatus.loading && <p className="mt-2 text-sm text-red-600">{searchStatus.error}</p>}
              
              {!searchStatus.loading && !searchStatus.noResults && filteredOwners.length > 0 && (
                <>
                  <select name="ownerId" value={formData.ownerId} onChange={handleChange}
                    className={`cursor-pointer mt-2 block w-full pl-10 p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.ownerId ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading.owners}
                  >
                    <option value="">Select Owner</option>
                    {filteredOwners.map(owner => {
                      const address = owner.Owner_address || 'No address';
                      return (
                        <option key={owner.Owner_id} value={owner.Owner_id} title={`${owner.Owner_name} - ${address}`}>
                          {owner.Owner_name} - {address.length > 30 ? `${address.substring(0, 30)}...` : address}
                        </option>
                      );
                    })}
                  </select>
                  {errors.ownerId && <p className="mt-1 text-sm text-red-600">{errors.ownerId}</p>}
                </>
              )}
              
              {selectedOwner && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-800">{selectedOwner.Owner_name}</h4>
                  <p className="text-sm text-gray-600">{selectedOwner.Owner_address}</p>
                </div>
              )}
            </div>
   
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPaw className="inline mr-2" /> Pet
              </label>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search pets..."
                    value={petSearchTerm}
                    onChange={(e) => setPetSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!formData.ownerId || loading.pets}
                  />
                </div>
              
              <select name="petId" value={formData.petId} onChange={handleChange}
                className={`cursor-pointer block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.petId ? 'border-red-500' : 'border-gray-300'}`}
                disabled={!formData.ownerId || loading.pets}
              >
                <option value="">{loading.pets ? 'Loading pets...' : (formData.ownerId ? 'Select Pet' : 'Select an owner first')}</option>
                {filteredPets.map(pet => (
                  <option key={pet.Pet_id} value={pet.Pet_id}>{pet.Pet_name} ({pet.Pet_type})</option>
                ))}
              </select>
              {errors.petId && <p className="mt-1 text-sm text-red-600">{errors.petId}</p>}
            </div>
          </div>
          {/* Date and Weight (no changes here) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"><FaCalendarAlt className="inline mr-2" /> Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} max={getTodayDateString()}
                className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><FaWeightHanging className="inline mr-2" /> Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="0" step="0.01"
                className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.weight ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
            </div>
          </div>
            
            <div className="space-y-4 pt-6 border-t border-gray-200">
               {/* Surgery Section (no changes here) */}
               <div className={`border rounded-md ${activeSections.surgery ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}`}>
                  <div className="flex justify-between items-center cursor-pointer p-4" onClick={() => toggleSection('surgery')}>
                    <h3 className="text-lg font-medium text-gray-800">Surgery Details</h3>
                    <FaChevronDown className={`transform transition-transform ${activeSections.surgery ? 'rotate-180' : ''}`} />
                  </div>
                  {activeSections.surgery && (
                    <div className="p-4 border-t border-gray-200">
                      <textarea name="surgery" value={formData.surgery} onChange={handleChange} rows={3}
                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.surgery ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter surgery details"
                      />
                       {errors.surgery && <p className="mt-1 text-sm text-red-600">{errors.surgery}</p>}
                    </div>
                  )}
                </div>

                {/* Vaccination Section (MODIFIED) */}
                <div className={`border rounded-md ${activeSections.vaccination ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300'}`}>
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

                {/* Other Notes Section (no changes here) */}
                <div className={`border rounded-md ${activeSections.otherNotes ? 'border-yellow-500 ring-1 ring-yellow-500' : 'border-gray-300'}`}>
                  <div className="flex justify-between items-center cursor-pointer p-4" onClick={() => toggleSection('otherNotes')}>
                    <h3 className="text-lg font-medium text-gray-800">Other Notes</h3>
                    <FaChevronDown className={`transform transition-transform ${activeSections.otherNotes ? 'rotate-180' : ''}`} />
                  </div>
                  {activeSections.otherNotes && (
                    <div className="p-4 border-t border-gray-200">
                      <textarea name="other" value={formData.other} onChange={handleChange} rows={3}
                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.other ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter any additional notes"
                      />
                       {errors.other && <p className="mt-1 text-sm text-red-600">{errors.other}</p>}
                    </div>
                  )}
                </div>
            </div>

            {errors.details && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{errors.details}</div>}

          {/* Form Actions (no changes here, logic is updated in functions) */}
          <div className="pt-4 flex flex-col sm:flex-row-reverse gap-4">
              <button type="submit" disabled={submitLoading || isFormIncomplete()}
                className="cursor-pointer flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? (
                  <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</>
                ) : (
                  <><FaPlus className="mr-2" />Add Medical Record</>
                )}
              </button>
             <button type="button" onClick={handleCancel}
              className="cursor-pointer sm:w-auto flex justify-center items-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
          {errors.submit && <p className="mt-2 text-sm text-red-600 text-center">{errors.submit}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};
export default RecordNew;
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- Helper Functions ---

// Gets today's date in YYYY-MM-DD format
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Icon Components (Inline SVG for simplicity) ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2 h-5 w-5 text-gray-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const PawPrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2 h-5 w-5 text-gray-600"><circle cx="11" cy="4" r="2"></circle><circle cx="18" cy="8" r="2"></circle><circle cx="20" cy="16" r="2"></circle><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-7 0V15a5 5 0 0 1 5-5z"></path><path d="M6 14.5a3.5 3.5 0 0 1-7 0V11a5 5 0 0 1 5-5h2"></path></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

// --- Main Component ---
export default function App({ onSuccess }) {
  const initialFormData = {
    ownerId: '',
    petId: '',
    date: getTodayDateString(),
    weight: '',
    wormer: '',
  };

  // --- State Management ---
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  
  // Owner related state
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [allOwners, setAllOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [isOwnerSearching, setIsOwnerSearching] = useState(false);

  // Pet related state
  const [petSearchTerm, setPetSearchTerm] = useState('');
  const [pets, setPets] = useState([]);
  const [isPetLoading, setIsPetLoading] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // API base URL
  const API_BASE_URL = 'http://localhost:3001/api';

  // --- Data Fetching and Filtering Effects ---

  // Effect to fetch all owners on initial component mount
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/all-owners`);
        setAllOwners(response.data);
        setFilteredOwners(response.data);
      } catch (error) {
        console.error('Error fetching owners:', error);
        setErrors(prev => ({...prev, form: 'Failed to load owners. Please try again.'}));
      }
    };
    fetchOwners();
  }, []);

  // Effect to search/filter owners based on search term (with debouncing)
  useEffect(() => {
    setIsOwnerSearching(true);
    const handler = setTimeout(async () => {
      try {
        if (ownerSearchTerm) {
          const response = await axios.post(`${API_BASE_URL}/search-owners-new`, { searchTerm: ownerSearchTerm });
          setFilteredOwners(response.data.data);
        } else {
          setFilteredOwners(allOwners);
        }
      } catch (error) {
        console.error('Error searching owners:', error);
        setErrors(prev => ({...prev, form: 'Failed to search owners. Please try again.'}));
      } finally {
        setIsOwnerSearching(false);
      }
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [ownerSearchTerm, allOwners]);

  // Effect to fetch pets when an owner is selected
  useEffect(() => {
    const fetchPets = async () => {
      if (!formData.ownerId) {
        setPets([]);
        setSelectedOwner(null);
        setFormData(prev => ({ ...prev, petId: '' }));
        return;
      }
      
      setIsPetLoading(true);
      try {
        const ownerDetails = allOwners.find(o => o.Owner_id == formData.ownerId);
        setSelectedOwner(ownerDetails);
        
        const response = await axios.post(`${API_BASE_URL}/get-pets`, { ownerId: formData.ownerId });
        setPets(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setPets([]); // No pets found
        } else {
          console.error('Error fetching pets:', error);
          setErrors(prev => ({...prev, form: 'Failed to load pets. Please try again.'}));
        }
      } finally {
        setIsPetLoading(false);
      }
    };

    fetchPets();
  }, [formData.ownerId, allOwners]);

  // Memoized filtered pets list
  const filteredPets = useMemo(() => {
    if (!petSearchTerm) return pets;
    return pets.filter(pet =>
      pet.Pet_name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      pet.Pet_type.toLowerCase().includes(petSearchTerm.toLowerCase())
    );
  }, [pets, petSearchTerm]);

  // --- Validation Effect ---
  useEffect(() => {
    const validate = () => {
        const newErrors = {};
        const today = getTodayDateString();

        if (touched.ownerId && !formData.ownerId) newErrors.ownerId = 'Owner must be selected.';
        if (touched.petId && !formData.petId) newErrors.petId = 'Pet must be selected.';
        if (touched.date && !formData.date) {
            newErrors.date = 'Date is required.';
        } else if (touched.date && formData.date > today) {
            newErrors.date = 'Future dates are not allowed.';
        }
        if (touched.weight && !formData.weight) {
            newErrors.weight = 'Weight is required.';
        } else if (touched.weight && (isNaN(formData.weight) || parseFloat(formData.weight) <= 0)) {
            newErrors.weight = 'Weight must be a positive number.';
        } else if (touched.weight && String(formData.weight).includes('.') && String(formData.weight).split('.')[1].length > 2) {
            newErrors.weight = 'Weight cannot have more than 2 decimal places.';
        }
        if (touched.wormer && !formData.wormer.trim()) newErrors.wormer = 'Wormer/Brand is required.';
        
        setErrors(newErrors);
    };

    validate();
  }, [formData, touched]);


  // --- Event Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  
  const handleCancel = () => {
      setFormData(initialFormData);
      setErrors({});
      setOwnerSearchTerm('');
      setPetSearchTerm('');
      setSelectedOwner(null);
      setPets([]);
      setTouched({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark all fields as touched to trigger validation messages
    setTouched({
        ownerId: true,
        petId: true,
        date: true,
        weight: true,
        wormer: true,
    });

    // Re-validate before submission
    const newErrors = {};
    const today = getTodayDateString();
    if (!formData.ownerId) newErrors.ownerId = 'Owner must be selected.';
    if (!formData.petId) newErrors.petId = 'Pet must be selected.';
    if (!formData.date) newErrors.date = 'Date is required.';
    else if (formData.date > today) newErrors.date = 'Future dates are not allowed.';
    if (!formData.weight) newErrors.weight = 'Weight is required.';
    else if (isNaN(formData.weight) || parseFloat(formData.weight) <= 0) newErrors.weight = 'Weight must be a positive number.';
    else if (String(formData.weight).includes('.') && String(formData.weight).split('.')[1].length > 2) newErrors.weight = 'Weight cannot have more than 2 decimal places.';
    if (!formData.wormer.trim()) newErrors.wormer = 'Wormer/Brand is required.';

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }
    
    setIsSubmitting(true);
    try {
        const submissionData = {
            pet_id: formData.petId,
            owner_id: formData.ownerId,
            date: formData.date,
            weight: formData.weight,
            wormer: formData.wormer,
        };
        
        await axios.post(`${API_BASE_URL}/deworm`, submissionData);

        if(onSuccess) {
            onSuccess();
        }
        handleCancel();

    } catch (error) {
        console.error('Submission failed:', error);
        let errorMessage = 'Failed to submit record. Please try again.';
        
        if (error.response) {
            if (error.response.status === 400) {
                errorMessage = error.response.data.error || 'Invalid data. Please check your inputs.';
            } else {
                errorMessage = error.response.data.error || errorMessage;
            }
        }
        
        setErrors(prev => ({...prev, form: errorMessage}));
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const isSaveDisabled = () => {
    const { ownerId, petId, weight, wormer } = formData;
    return isSubmitting || !ownerId || !petId || !weight || !wormer || Object.keys(errors).length > 0;
  };
  
  return (
    <div className="w-full">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">New Deworming Record</h1>
        <p className="text-center text-gray-500 mb-8">Fill all the details below to create a new record.</p>

        <form onSubmit={handleSubmit} noValidate className="bg-white p-8 space-y-8">
          {/* --- Owner and Pet Selection Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Owner Selection Column */}
            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-700">
                <UserIcon />
                Owner
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or address..."
                  value={ownerSearchTerm}
                  onChange={(e) => setOwnerSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              {isOwnerSearching && <p className="text-sm text-gray-500">Searching...</p>}
              
              <select
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
                className={`cursor-pointer block w-full p-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition ${errors.ownerId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select an Owner</option>
                {filteredOwners.length > 0 ? (
                  filteredOwners.map(owner => (
                    <option key={owner.Owner_id} value={owner.Owner_id}>
                      {owner.Owner_name}
                    </option>
                  ))
                ) : !isOwnerSearching && (
                  <option disabled>No owners found</option>
                )}
              </select>
              {errors.ownerId && <p className="text-sm text-red-600">{errors.ownerId}</p>}

              {selectedOwner && (
                <div className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-800">{selectedOwner.Owner_name}</h4>
                  <p className="text-sm text-gray-600">{selectedOwner.Owner_address}</p>
                </div>
              )}
            </div>

            {/* Pet Selection Column */}
            <div className="space-y-2">
                <label className="block text-md font-semibold text-gray-700">
                    <PawPrintIcon />
                    Pet
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by pet name or type..."
                        value={petSearchTerm}
                        onChange={(e) => setPetSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!formData.ownerId || isPetLoading}
                    />
                </div>
                <select
                    name="petId"
                    value={formData.petId}
                    onChange={handleChange}
                    className={`cursor-pointer block w-full p-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed ${errors.petId ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={!formData.ownerId || isPetLoading}
                >
                    <option value="">{isPetLoading ? 'Loading...' : (formData.ownerId ? 'Select a Pet' : 'Select an owner first')}</option>
                    {filteredPets.length > 0 ? (
                        filteredPets.map(pet => (
                            <option 
                                key={pet.Pet_id} value={pet.Pet_id}>
                                {pet.Pet_name} ({pet.Pet_type})
                            </option>
                        ))
                    ) : !isPetLoading && formData.ownerId && (
                        <option disabled>No pets found for this owner</option>
                    )}
                </select>
                {errors.petId && <p className="text-sm text-red-600">{errors.petId}</p>}
            </div>
          </div>

          {/* --- Other Details Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
             <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} max={getTodayDateString()} className={`block w-full p-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition ${errors.date ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
            </div>
             <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input type="number" name="weight" id="weight" placeholder="e.g., 15.5" value={formData.weight} onChange={handleChange} min="0" step="0.01" className={`block w-full p-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition ${errors.weight ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.weight && <p className="text-sm text-red-600 mt-1">{errors.weight}</p>}
            </div>
             <div>
                <label htmlFor="wormer" className="block text-sm font-medium text-gray-700 mb-1">Wormer/Brand</label>
                <input type="text" name="wormer" id="wormer" placeholder="e.g., Drontal" value={formData.wormer} onChange={handleChange} className={`block w-full p-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition ${errors.wormer ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.wormer && <p className="text-sm text-red-600 mt-1">{errors.wormer}</p>}
            </div>
          </div>
          
          {errors.form && <p className="text-center text-red-600">{errors.form}</p>}

          {/* --- Action Buttons --- */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <button
                type="button"
                onClick={handleCancel}
                className="cursor-pointer px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isSaveDisabled()}
                className="cursor-pointer px-6 py-2 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
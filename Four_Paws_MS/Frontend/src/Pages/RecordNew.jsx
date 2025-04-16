import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPaw, FaCalendarAlt, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';

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
    vaccination: '',
    other: ''
  });
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [petSearchTerm, setPetSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

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
        try {
          const response = await axios.post('http://localhost:3001/api/search-owners', {
            searchTerm: ownerSearchTerm
          });
          setFilteredOwners(response.data);
        } catch (error) {
          console.error('Error searching owners:', error);
        }
      };
      
      const timer = setTimeout(() => {
        search();
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setFilteredOwners(allOwners);
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
          setFormData(prev => ({ ...prev, petId: '' })); // Reset pet selection
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ownerId) newErrors.ownerId = 'Owner is required';
    if (!formData.petId) newErrors.petId = 'Pet is required';
    
    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      newErrors.date = 'Invalid date format (YYYY-MM-DD required)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        ownerId: formData.ownerId // Ensure ownerId is included
      };
      
      await axios.post('http://localhost:3001/api/records', payload);
      navigate('/records', { state: { success: 'Record added successfully!' } });
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
            onClick={() => navigate(-1)}
            className="text-white hover:text-blue-200"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-6">
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
              
              {/* Owner Dropdown */}
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
              
              {/* Selected Owner Info */}
              {selectedOwner && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-800">{selectedOwner.Owner_name}</h4>
                  <p className="text-sm text-gray-600">{selectedOwner.Owner_Address}</p>
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
                className={`mt-1 block w-full pl-10 p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Surgery Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surgery Details
              </label>
              <textarea
                name="surgery"
                value={formData.surgery}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter surgery details if applicable"
              />
            </div>

            {/* Vaccination Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccination Details
              </label>
              <textarea
                name="vaccination"
                value={formData.vaccination}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter vaccination details if applicable"
              />
            </div>

            {/* Other Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Notes
              </label>
              <textarea
                name="other"
                value={formData.other}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any additional notes"
              />
            </div>

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
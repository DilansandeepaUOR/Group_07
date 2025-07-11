import { useState, useEffect } from 'react';
import axios from 'axios';
// React Icons
import { FaSearch, FaFilter, FaCalendarAlt, FaTimes, FaEdit, FaTrash, FaSave, FaChevronDown, FaUser, FaPaw, FaWeightHanging, FaCheck } from 'react-icons/fa';
// Ant Design is only used for the Modal container and messages
import { Modal, message, ConfigProvider } from 'antd';


//===================================================================================//
//               EDIT RECORD MODAL                                                   //
//===================================================================================//
const EditRecordModal = ({ id, visible, onClose, onUpdateSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
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

  const [selectedPet, setSelectedPet] =useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [errors, setErrors] = useState({});

  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3001/api/full-record/${id}`);
        const record = response.data;

        // Set state for display info
        setSelectedOwner({ name: record.Owner_name, email: record.E_mail });
        const petRes = await axios.post('http://localhost:3001/api/get-pets', { ownerId: record.Owner_id });
        setSelectedPet(petRes.data.find(p => p.Pet_id === record.Pet_id));

        // Set state for form data
        setFormData({
            petId: record.Pet_id,
            date: record.date.split('T')[0],
            weight: record.weight || '',
            surgery: record.surgery || '',
            other: record.other || '',
            vaccineType: record.vaccine_type || '',
            coreVaccine: record.vaccine_type === 'core' ? record.vaccine_name || '' : '',
            lifestyleVaccine: record.vaccine_type === 'lifestyle' ? record.vaccine_name || '' : '',
            otherVaccine: record.other_vaccine || '',
        });
        
        // Set state for accordion visibility
        setActiveSections({
          surgery: !!record.surgery,
          vaccination: !!record.vaccination_id,
          otherNotes: !!record.other,
        });

      } catch (error) {
        console.error(error);
        message.error('Failed to load record data.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSection = (section) => setActiveSections(prev => ({ ...prev, [section]: !prev[section] }));

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date || formData.date > getTodayDateString()) newErrors.date = 'A valid date is required';
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Weight must be a positive number.';
    } else if (String(formData.weight).includes('.') && String(formData.weight).split('.')[1].length > 2) {
      newErrors.weight = 'Weight cannot exceed 2 decimal places.';
    }
    if (!activeSections.surgery && !activeSections.vaccination && !activeSections.otherNotes) newErrors.details = 'At least one detail section must be active';

    if (activeSections.vaccination) {
      if (!formData.vaccineType) newErrors.vaccination = 'Please select a vaccine type';
      else if (formData.vaccineType === 'core' && !formData.coreVaccine) newErrors.vaccination = 'Please select a core vaccine';
      else if (formData.vaccineType === 'lifestyle' && !formData.lifestyleVaccine) newErrors.vaccination = 'Please select a lifestyle vaccine';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    // Prevent default form submission if triggered by 'Enter' key
    if (e) e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    try {
      const payload = {
        date: formData.date,
        weight: formData.weight,
        surgery: activeSections.surgery ? formData.surgery : null,
        other: activeSections.otherNotes ? formData.other : null,
        petId: formData.petId,
        vaccineType: activeSections.vaccination ? formData.vaccineType : null,
        coreVaccine: activeSections.vaccination && formData.vaccineType === 'core' ? formData.coreVaccine : null,
        lifestyleVaccine: activeSections.vaccination && formData.vaccineType === 'lifestyle' ? formData.lifestyleVaccine : null,
        otherVaccine: activeSections.vaccination ? formData.otherVaccine : null,
      };
      
      const response = await axios.put(`http://localhost:3001/api/update-record/${id}`, payload);
      
      if (response.data.success) {
        message.success('Record updated successfully!');
        onUpdateSuccess();
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to update record.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Medical Record"
      open={visible} // 'visible' is deprecated, 'open' is the new prop
      onOk={handleSubmit} // Trigger custom submit on OK click
      onCancel={onClose}
      width={800}
      okText="Save Changes"
      cancelText="Cancel"
      confirmLoading={submitLoading}
      // We remove the modal's own footer to use our custom buttons if we wanted,
      // but here we map onOk to our handler for simplicity.
    >
      {loading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div></div>
      ) : (
        <form id="edit-record-form" onSubmit={handleSubmit} className="space-y-8 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><FaUser className="inline mr-2" /> Owner</label>
                  <div className="p-3 bg-gray-50 rounded-md border"><h4 className="font-medium text-gray-800">{selectedOwner?.name}</h4><p className="text-sm text-gray-600">{selectedOwner?.email}</p></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><FaPaw className="inline mr-2" /> Pet</label>
                  <div className="p-3 bg-gray-50 rounded-md border"><h4 className="font-medium text-gray-800">{selectedPet?.Pet_name}</h4><p className="text-sm text-gray-600 capitalize">{selectedPet?.Pet_type}</p></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><FaCalendarAlt className="inline mr-2" /> Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} max={getTodayDateString()} className={`w-full p-2 border rounded-md ${errors.date ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"><FaWeightHanging className="inline mr-2" /> Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="0.01" step="0.01" className={`w-full p-2 border rounded-md ${errors.weight ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
                </div>
            </div>

            {/* Accordion Sections Restored */}
            <div className="space-y-4 pt-6 border-t">
              <div className={`border rounded-md ${activeSections.surgery ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}`}>
                  <div className="flex justify-between items-center cursor-pointer p-2" onClick={() => toggleSection('surgery')}><h6 className="text-sm font-medium">Surgery Details</h6><FaChevronDown className={`transform transition-transform ${activeSections.surgery ? 'rotate-180' : ''}`} /></div>
                  {activeSections.surgery && <div className="p-4 border-t"><textarea name="surgery" value={formData.surgery} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md" placeholder="Enter surgery details"/></div>}
              </div>

              <div className={`border rounded-md ${activeSections.vaccination ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300'}`}>
                  <div className="flex justify-between items-center cursor-pointer p-2" onClick={() => toggleSection('vaccination')}><h4 className="text-sm font-medium">Vaccination Details</h4><FaChevronDown className={`transform transition-transform ${activeSections.vaccination ? 'rotate-180' : ''}`} /></div>
                  {activeSections.vaccination && (
                    <div className="p-4 border-t space-y-4">
                       <select name="vaccineType" value={formData.vaccineType} onChange={handleChange} className="w-full p-2 border rounded-md text-sm"><option value="">Select Type</option><option value="core">Core</option><option value="lifestyle">Lifestyle</option></select>
                       {formData.vaccineType === 'core' && <select name="coreVaccine" value={formData.coreVaccine} onChange={handleChange} className="w-full p-2 border rounded-md text-sm"><option value="">Select Core Vaccine</option><option value="DA2PP">DA2PP*</option><option value="Leptospirosis">Leptospirosis</option><option value="Rabies">Rabies**</option></select>}
                       {formData.vaccineType === 'lifestyle' && <select name="lifestyleVaccine" value={formData.lifestyleVaccine} onChange={handleChange} className="w-full p-2 border rounded-md text-sm"><option value="">Select Lifestyle Vaccine</option><option value="Bordetella">Bordetella</option><option value="Parainfluenza">Parainfluenza</option><option value="Lyme">Lyme</option><option value="Canine Influenza">Canine Influenza</option></select>}
                       <input type="text" name="otherVaccine" value={formData.otherVaccine} onChange={handleChange} className="w-full p-2 border rounded-md text-sm" placeholder="Other vaccine (optional)" />
                       {errors.vaccination && <p className="text-sm text-red-600">{errors.vaccination}</p>}
                    </div>
                  )}
              </div>

              <div className={`border rounded-md ${activeSections.otherNotes ? 'border-yellow-500 ring-1 ring-yellow-500' : 'border-gray-300'}`}>
                  <div className="flex justify-between items-center cursor-pointer p-2" onClick={() => toggleSection('otherNotes')}><h3 className="text-sm font-medium">Other Notes</h3><FaChevronDown className={`transform transition-transform ${activeSections.otherNotes ? 'rotate-180' : ''}`} /></div>
                  {activeSections.otherNotes && <div className="p-4 border-t"><textarea name="other" value={formData.other} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md" placeholder="Enter additional notes"/></div>}
              </div>
            </div>
            {errors.details && <div className="p-3 bg-red-100 text-red-700 rounded-md">{errors.details}</div>}
        </form>
      )}
    </Modal>
  );
};


//===================================================================================//
//                           ALL RECORDS COMPONENT                                   //
//===================================================================================//
const AllRecords = () => {
    // ... All state and functions from your previous correct version ...
    const [allRecords, setAllRecords] = useState([]);
    const [displayedRecords, setDisplayedRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [years, setYears] = useState([]);
    const [filters, setFilters] = useState({ year: '', month: '', date: '' });
    const [isFiltered, setIsFiltered] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecordId, setEditingRecordId] = useState(null);

    //For delete modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        isLoading: false
    });

    const fetchAllRecords = async () => {
        setLoading(true);
        try {
            const [recordsRes, yearsRes] = await Promise.all([
                axios.get('http://localhost:3001/api/all-records'),
                axios.get('http://localhost:3001/api/record-years')
            ]);
            setAllRecords(recordsRes.data);
            setYears(yearsRes.data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllRecords(); }, []);

    useEffect(() => {
        const startIndex = (currentPage - 1) * recordsPerPage;
        setDisplayedRecords(allRecords.slice(startIndex, startIndex + recordsPerPage));
        setTotalPages(Math.ceil(allRecords.length / recordsPerPage));
    }, [currentPage, allRecords, recordsPerPage]);

    const applyFilters = async () => {
        setLoading(true);
        setIsFiltered(true);
        try {
            const response = await axios.post('http://localhost:3001/api/filtered-records', { searchTerm, ...filters });
            setAllRecords(response.data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error filtering records:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearAllFilters = () => {
        setFilters({ year: '', month: '', date: '' });
        setSearchTerm('');
        setIsFiltered(false);
        fetchAllRecords();
    };
    
    const handleEditClick = (id) => { setEditingRecordId(id); setIsEditModalOpen(true); };
    const handleCloseModal = () => { setIsEditModalOpen(false); setEditingRecordId(null); };
    const handleUpdateSuccess = () => { handleCloseModal(); fetchAllRecords(); };

    const handleDelete = (id) => {
    setDeleteModal({
        isOpen: true,
        id,
        isLoading: false
    });
    };
    
    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterSubmit = (e) => { e.preventDefault(); applyFilters(); };
    const months = Array.from({ length: 12 }, (e, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('en', { month: 'long' }) }));
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));


    return (
        <ConfigProvider theme={{ token: { fontSize: 16 }}}>
            <div className="p-6 max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Medical Records</h1>
                    {/* Filter and Search Section */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-grow w-full"><FaSearch className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Search by owner or pet name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && applyFilters()} className="pl-10 pr-10 w-full p-2 border rounded-md"/>{searchTerm && <button onClick={clearAllFilters} className="absolute right-3 top-1/2 -translate-y-1/2" title="Clear"><FaTimes className="text-gray-500 hover:text-gray-700" /></button>}</div>
                            <div className="flex flex-shrink-0 gap-2"><button onClick={applyFilters} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"><FaSearch /> Search</button><button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-md hover:bg-gray-100"><FaFilter /> Filters</button></div>
                        </div>
                        {showFilters && (
                            <form onSubmit={handleFilterSubmit} className="mt-4 p-4 bg-white border rounded-lg shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><select name="year" value={filters.year} onChange={handleFilterChange} className="w-full p-2 border rounded-md"><option value="">All Years</option>{years.map(y => <option key={y.year} value={y.year}>{y.year}</option>)}</select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Month</label><select name="month" value={filters.month} onChange={handleFilterChange} className="w-full p-2 border rounded-md"><option value="">All Months</option>{months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label><input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="w-full p-2 border rounded-md" /></div>
                                </div>
                                <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={clearAllFilters} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Clear</button><button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">Apply Filters</button></div>
                            </form>
                        )}
                    </div>
                    {/* Records Table */}
                    <div className="overflow-x-auto">
                        {loading ? <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div></div> : allRecords.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-lg"><FaCalendarAlt className="mx-auto text-gray-400 text-4xl" /><p className="mt-2 text-gray-600">{isFiltered ? "No records match your filters." : "No records found."}</p></div> : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {displayedRecords.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4"><div className="font-medium text-gray-900">{record.Owner_name}</div><div className="text-sm text-gray-500">{record.E_mail}</div></td>
                                                <td className="px-6 py-4"><div className="font-medium text-gray-900">{record.Pet_name}</div><div className="text-sm text-gray-500 capitalize">{record.Pet_type}</div></td>
                                                <td className="px-6 py-4 text-sm max-w-xs truncate"><div className="text-gray-900">{record.weight && <p><b>Weight:</b> {record.weight}kg</p>}{record.surgery && <p><b>Surgery:</b> {record.surgery}</p>}{(record.vaccine_name || record.other_vaccine) && <p><b>Vaccine:</b> {record.vaccine_name || record.other_vaccine}</p>}{record.other && <p><b>Notes:</b> {record.other}</p>}</div></td>
                                                <td className="px-6 py-4 text-right"><div className="flex justify-end space-x-2"><button onClick={() => handleEditClick(record.id)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50" title="Edit"><FaEdit className="h-5 w-5" /></button><button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" title="Delete"><FaTrash className="h-5 w-5" /></button></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div><p className="text-sm text-gray-700">Showing <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * recordsPerPage, allRecords.length)}</span> of <span className="font-medium">{allRecords.length}</span> results</p></div>
                                        <div className="flex items-center"><button onClick={goToPrevPage} disabled={currentPage === 1} className="px-4 py-2 mx-1 text-sm bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50">Previous</button><span className="mx-4 text-sm">Page {currentPage} of {totalPages}</span><button onClick={goToNextPage} disabled={currentPage === totalPages} className="px-4 py-2 mx-1 text-sm bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50">Next</button></div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                {isEditModalOpen && <EditRecordModal id={editingRecordId} visible={isEditModalOpen} onClose={handleCloseModal} onUpdateSuccess={handleUpdateSuccess} />}
                {/*/ Delete modal */}
                {deleteModal.isOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50 shadow-2xl">
                    <div className="bg-green-100 rounded-lg p-6 max-w-md w-full shadow-2xl">
                    <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
                    <p className="mb-6">Are you sure you want to delete this record? This action cannot be undone.</p>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                        onClick={() => setDeleteModal({ isOpen: false, id: null })}
                        className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={deleteModal.isLoading}
                        >
                        Cancel
                        </button>
                        <button
                        onClick={async () => {
                            setDeleteModal(prev => ({ ...prev, isLoading: true }));
                            try {
                            await axios.delete(`http://localhost:3001/api/delete-record/${deleteModal.id}`);
                            if (displayedRecords.length === 1 && currentPage > 1) {
                                setCurrentPage(currentPage - 1);
                            }
                            fetchAllRecords();
                            message.success('Record deleted successfully!');
                            } catch (error) {
                            console.error(error);
                            alert('Failed to delete record');
                            } finally {
                            setDeleteModal({ isOpen: false, id: null, isLoading: false });
                            }
                        }}
                        className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        disabled={deleteModal.isLoading}
                        >
                        {deleteModal.isLoading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                    </div>
                </div>
                )}
            </div>
        </ConfigProvider>
    );
};

export default AllRecords;
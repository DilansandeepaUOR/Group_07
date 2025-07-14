import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import axios from 'axios';
import { FaSearch, FaEdit, FaTrash, FaTimes, FaFilter } from 'react-icons/fa';
import { message, Modal } from 'antd';

const DewormEdit = lazy(() => import('./DewormEdit'));

const DewormRecords = () => {
    const [allRecords, setAllRecords] = useState([]);
    const [displayedRecords, setDisplayedRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearchTerm, setActiveSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(6);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState(null);

    // --- NEW: State for filters ---
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ year: '', month: '', date: '' });
    const [years, setYears] = useState([]);
    const [months] = useState([
        { value: '01', label: 'January' }, { value: '02', label: 'February' },
        { value: '03', label: 'March' }, { value: '04', label: 'April' },
        { value: '05', label: 'May' }, { value: '06', label: 'June' },
        { value: '07', label: 'July' }, { value: '08', label: 'August' },
        { value: '09', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' }
    ]);

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        isLoading: false
    });

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:3001/api/deworm-records');
            setAllRecords(data);
            // --- NEW: Extract unique years from records ---
            const uniqueYears = [...new Set(data.map(record => new Date(record.date).getFullYear()))]
                .sort((a, b) => b - a) 
                .map(year => ({ year }));
            setYears(uniqueYears);
        } catch (error) {
            console.error('Error fetching deworming records:', error);
            message.error('Failed to fetch records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleEdit = (id) => {
        setSelectedRecordId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRecordId(null);
    };

    const handleUpdateSuccess = () => {
        handleCloseModal();
        fetchRecords();
        message.success('Record updated successfully!');
    };

    // --- UPDATED: Memoized filtering logic now includes filters ---
    const filteredRecords = useMemo(() => {
        return allRecords.filter(record => {
            const recordDate = new Date(record.date);
            const term = activeSearchTerm.toLowerCase().trim();

            // Search term filter
            const matchesSearch = !term || 
                record.Owner_name?.toLowerCase().includes(term) ||
                record.Pet_name?.toLowerCase().includes(term);

            // Date filters
            const matchesYear = !filters.year || recordDate.getFullYear().toString() === filters.year;
            const matchesMonth = !filters.month || (recordDate.getMonth() + 1).toString().padStart(2, '0') === filters.month;
            const matchesDate = !filters.date || recordDate.toISOString().slice(0, 10) === filters.date;

            return matchesSearch && matchesYear && matchesMonth && matchesDate;
        });
    }, [allRecords, activeSearchTerm, filters]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        setDisplayedRecords(filteredRecords.slice(startIndex, endIndex));
    }, [filteredRecords, currentPage, recordsPerPage]);

    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, id: id, isLoading: false });
    };

    const confirmDelete = async () => {
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        try {
            await axios.delete(`http://localhost:3001/api/deworm-records/${deleteModal.id}`);
            message.success('Record deleted successfully!');
            if (displayedRecords.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
            await fetchRecords();
        } catch (error) {
            console.error('Error deleting record:', error);
            message.error('Failed to delete record.');
        } finally {
            setDeleteModal({ isOpen: false, id: null, isLoading: false });
        }
    };

    // --- NEW: Handlers for filters ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const applyFilters = () => {
        setActiveSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setActiveSearchTerm('');
        setFilters({ year: '', month: '', date: '' });
        setCurrentPage(1);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Deworming Records</h1>

            {/* --- NEW: Filter and Search Section --- */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                        <FaSearch className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Search by owner or pet name..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && applyFilters()} 
                            className="pl-10 pr-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-[#028478] focus:border-transparent"
                        />
                        {searchTerm && (
                            <button onClick={clearAllFilters} className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2" title="Clear">
                                <FaTimes className="cursor-pointer text-gray-500 hover:text-gray-700" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                        {searchTerm.trim() ? (
                            <button onClick={applyFilters} className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-150">
                                <FaSearch /> Search
                            </button>
                        ) : (
                            <span className="flex items-center gap-2 bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed">
                                <FaSearch /> Search
                            </span>
                        )}
                        <button onClick={() => setShowFilters(!showFilters)} className="cursor-pointer flex items-center gap-2 bg-white border px-4 py-2 rounded-md hover:bg-gray-100">
                            <FaFilter /> Filters
                        </button>
                    </div>
                </div>
                {showFilters && (
                    <form onSubmit={handleFilterSubmit} className="mt-4 p-4 bg-white border rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <select name="year" value={filters.year} onChange={handleFilterChange} className="w-full p-2 border rounded-md">
                                    <option value="">All Years</option>
                                    {years.map(y => <option key={y.year} value={y.year}>{y.year}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                <select name="month" value={filters.month} onChange={handleFilterChange} className="w-full p-2 border rounded-md">
                                    <option value="">All Months</option>
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label>
                                <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="w-full p-2 border rounded-md" />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button type="button" onClick={clearAllFilters} className="cursor-pointer px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Clear</button>
                            <button type="submit" className="cursor-pointer px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">Apply Filters</button>
                        </div>
                    </form>
                )}
            </div>


            <div className="overflow-x-auto">
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : displayedRecords.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">No records found.</div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wormer</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayedRecords.map((record) => (
                                    <tr key={record.deworm_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{record.Owner_name}</td>
                                        <td className="px-6 py-4">{record.Pet_name}</td>
                                        <td className="px-6 py-4">{record.weight.toFixed(2)}</td>
                                        <td className="px-6 py-4">{record.wormer}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => handleEdit(record.deworm_id)} className="cursor-pointer text-blue-600 hover:text-blue-900 p-1" title="Edit">
                                                    <FaEdit className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDelete(record.deworm_id)} className="cursor-pointer text-red-600 hover:text-red-900 p-1" title="Delete">
                                                    <FaTrash className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * recordsPerPage, filteredRecords.length)}</span> of <span className="font-medium">{filteredRecords.length}</span> results
                            </p>
                        </div>
                        <div className="flex items-center">
                            <button 
                                onClick={goToPrevPage} 
                                disabled={currentPage === 1} 
                                className="cursor-pointer px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="mx-4 text-sm">Page {currentPage} of {totalPages}</span>
                            <button 
                                onClick={goToNextPage} 
                                disabled={currentPage === totalPages} 
                                className="cursor-pointer px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        </div>
                        )}
                    </>
                )}
            </div>
            
            {isModalOpen && (
                <Modal 
                    title="Edit Deworming Record"
                    open={isModalOpen}
                    onCancel={handleCloseModal}
                    footer={null}
                    destroyOnClose
                >
                    <Suspense fallback={<div className="p-8 text-center">Loading Editor...</div>}>
                        <DewormEdit 
                            id={selectedRecordId}
                            onSuccess={handleUpdateSuccess}
                            onCancel={handleCloseModal}
                        />
                    </Suspense>
                </Modal>
            )}

            {deleteModal.isOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                    <div className="absolute inset-0 bg-opacity-30 backdrop-blur-sm" onClick={() => setDeleteModal({ isOpen: false, id: null, isLoading: false })}></div>
                    <div className="relative z-10 bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                        <p className="mb-6 text-gray-600">Are you sure you want to delete this record? This action cannot be undone.</p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, id: null, isLoading: false })}
                                className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={deleteModal.isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
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
    );
};

export default DewormRecords;
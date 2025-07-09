import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import axios from 'axios';
import { FaSearch, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

// Lazily import the edit component for the modal
const DewormEdit = lazy(() => import('./DewormEdit'));

// A simple, reusable Modal component styled with Tailwind CSS
const Modal = ({ children, onClose }) => (
    <div 
        className="fixed inset-0 bg-opacity-30 z-40 flex justify-center items-center p-4 backdrop-blur-xs"
        onClick={onClose}
    >
        <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full relative z-50"
            onClick={e => e.stopPropagation()}
        >
            <button 
                onClick={onClose} 
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                title="Close"
            >
                <FaTimes className="h-6 w-6" />
            </button>
            {children}
        </div>
    </div>
);

const DewormRecords = () => {
    const [allRecords, setAllRecords] = useState([]);
    const [displayedRecords, setDisplayedRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    // State for the text currently in the search box
    const [searchTerm, setSearchTerm] = useState('');
    // State for the term that is actively being used to filter
    const [activeSearchTerm, setActiveSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(6);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState(null);


    // --- NEW: Handlers for opening, closing, and succeeding the modal ---
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
        fetchRecords(); // Refresh the records list after an update
        alert('Record updated successfully!'); // Provide user feedback
    };    

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:3001/api/deworm-records');
            setAllRecords(data);
        } catch (error) {
            console.error('Error fetching deworming records:', error);
            alert('Failed to fetch records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Memoized filtering logic now depends on `activeSearchTerm`
    const filteredRecords = useMemo(() => {
        const term = activeSearchTerm.toLowerCase().trim();
        if (!term) {
            return allRecords; // If no active search, return all records
        }
        return allRecords.filter(record =>
            record.Owner_name?.toLowerCase().includes(term) ||
            record.Pet_name?.toLowerCase().includes(term)
        );
    }, [allRecords, activeSearchTerm]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        setDisplayedRecords(filteredRecords.slice(startIndex, endIndex));
    }, [filteredRecords, currentPage, recordsPerPage]);
    
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`http://localhost:3001/api/deworm-records/${id}`);
                alert('Record deleted successfully!');
                fetchRecords(); // Refetch records to update the list
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('Failed to delete record.');
            }
        }
    };

    // Function to apply the search
    const handleSearch = () => {
        setActiveSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    // Function to clear the search input and results
    const clearSearch = () => {
        setSearchTerm('');
        setActiveSearchTerm('');
        setCurrentPage(1);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Deworming Records</h1>

            {/* --- MODIFIED SEARCH BAR AREA --- */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Input Container */}
                    <div className="relative flex-grow w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by owner or pet name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10 pr-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#028478] focus:border-transparent"
                        />
                        {searchTerm && (
                            <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center" title="Clear search">
                                <FaTimes className="text-gray-500 hover:text-gray-700" />
                            </button>
                        )}
                    </div>
                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors justify-center flex-shrink-0"
                    >
                        <FaSearch /> Search
                    </button>
                </div>
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
                                                <button onClick={() => handleEdit(record.deworm_id)} className="text-blue-600 hover:text-blue-900 p-1" title="Edit">
                                                    <FaEdit className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDelete(record.deworm_id)} className="text-red-600 hover:text-red-900 p-1" title="Delete">
                                                    <FaTrash className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* --- NEW: Conditionally render the modal for editing --- */}
            {isModalOpen && (
                <Modal onClose={handleCloseModal}>
                    <Suspense fallback={<div className="p-8 text-center">Loading Editor...</div>}>
                        <DewormEdit 
                            id={selectedRecordId}
                            onSuccess={handleUpdateSuccess}
                            onCancel={handleCloseModal}
                        />
                    </Suspense>
                </Modal>
            )}
        </div>
    );
};

export default DewormRecords;
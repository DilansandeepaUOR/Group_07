import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaCalendarAlt, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
//import { useNavigate } from 'react-router-dom';

const AllRecords = ({ onEdit }) => {
    const [allRecords, setAllRecords] = useState([]);
    const [displayedRecords, setDisplayedRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [years, setYears] = useState([]);
    const [filters, setFilters] = useState({
        year: '',
        month: '',
        date: ''
    });
    const [isFiltered, setIsFiltered] = useState(false); // Track if a filter or search is active
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(6); // Rows per page is set to 6
    const [totalPages, setTotalPages] = useState(1);
    //const navigate = useNavigate();

    // This useEffect fetches the initial data when the component mounts.
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [recordsRes, yearsRes] = await Promise.all([
                    axios.get('http://localhost:3001/api/all-records'),
                    axios.get('http://localhost:3001/api/record-years')
                ]);
                setAllRecords(recordsRes.data);
                setYears(yearsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // This useEffect updates the displayed records whenever the page or the master record list changes.
    useEffect(() => {
        const updateDisplayedRecords = () => {
            const startIndex = (currentPage - 1) * recordsPerPage;
            const endIndex = startIndex + recordsPerPage;
            setDisplayedRecords(allRecords.slice(startIndex, endIndex));
            setTotalPages(Math.ceil(allRecords.length / recordsPerPage));
        };
        updateDisplayedRecords();
    }, [currentPage, allRecords, recordsPerPage]);


    // Function to apply search and filters
    const applyFilters = async () => {
        setLoading(true);
        setIsFiltered(true); // A search or filter has been applied
        try {
            const response = await axios.post('http://localhost:3001/api/filtered-records', {
                searchTerm,
                year: filters.year,
                month: filters.month,
                date: filters.date
            });
            setAllRecords(response.data);
            setCurrentPage(1); // Reset to the first page after filtering
        } catch (error) {
            console.error('Error filtering records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Clears all filters and search, then refetches all records.
    const clearAllFilters = () => {
        setFilters({ year: '', month: '', date: '' });
        setSearchTerm('');
        setIsFiltered(false); // Reset filter state
        setLoading(true);
        axios.get('http://localhost:3001/api/all-records')
            .then(res => {
                setAllRecords(res.data);
                setCurrentPage(1);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const months = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' }
    ];

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`http://localhost:3001/api/delete-record/${id}`);
                // Refetch all records to ensure data consistency
                const response = await axios.get('http://localhost:3001/api/all-records');
                setAllRecords(response.data);
                // If the last item on a page is deleted, go to the previous page
                if (displayedRecords.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('Failed to delete record');
            }
        }
    };

    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));


    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Medical Records</h1>

            {/* Search and Filter Bar */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                      {/* Search Input Container: 'flex-grow' allows it to take up the most space. */}
                      <div className="relative flex-grow w-full">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaSearch className="text-gray-400" />
                          </div>
                          <input
                              type="text"
                              placeholder="Search by owner or pet name..."
                              value={searchTerm}
                              onChange={handleSearch}
                              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                              className="pl-10 pr-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {/* Clear Search Button */}
                          {searchTerm && (
                              <button onClick={clearAllFilters} className="absolute inset-y-0 right-0 pr-3 flex items-center" title="Clear search">
                                  <FaTimes className="text-gray-500 hover:text-gray-700" />
                              </button>
                          )}
                      </div>

                      {/* Button Group: 'flex-shrink-0' prevents this group from shrinking. */}
                      <div className="flex flex-shrink-0 gap-2">
                          <button onClick={applyFilters} className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors justify-center">
                              <FaSearch /> Search
                          </button>
                          <button onClick={() => setShowFilters(!showFilters)} className="cursor-pointer flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors justify-center">
                              <FaFilter /> Filters
                          </button>
                      </div>
                  </div>
                {showFilters && (
                    <form onSubmit={handleFilterSubmit} className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <select name="year" value={filters.year} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">All Years</option>
                                    {years.map(y => <option key={y.year} value={y.year}>{y.year}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                <select name="month" value={filters.month} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">All Months</option>
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label>
                                <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button type="button" onClick={clearAllFilters} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                                Clear Filters
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                Apply Filters
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-600">Loading records...</p>
                    </div>
                ) : allRecords.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <FaCalendarAlt className="mx-auto text-gray-400 text-4xl" />
                        <p className="mt-2 text-gray-600">{isFiltered ? "No records match your filters." : "No records found."}</p>
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayedRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{record.Owner_name}</div>
                                            <div className="text-sm text-gray-500">{record.E_mail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{record.Pet_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                                {record.Pet_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {record.weight && <p><span className="font-medium">Weight (kg):</span> {record.weight}</p>}
                                                {record.surgery && <p><span className="font-medium">Surgery:</span> {record.surgery}</p>}
                                                {record.other && <p><span className="font-medium">Notes:</span> {record.other}</p>}
                                                {(record.vaccine_name || record.other_vaccine) && (
                                                    <div className="mt-1">
                                                        <span className="font-medium">Vaccination:</span>
                                                        <div className="ml-2">
                                                            {record.vaccine_type === 'core' && <p>Core: {record.vaccine_name}</p>}
                                                            {record.vaccine_type === 'lifestyle' && <p>Lifestyle: {record.vaccine_name}</p>}
                                                            {record.other_vaccine && <p>Other: {record.other_vaccine}</p>}
                                                            {record.vaccination_notes && <p>Notes: {record.vaccination_notes}</p>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => onEdit(record.id)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors" title="Edit">
                                                    <FaEdit className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors" title="Delete">
                                                    <FaTrash className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination with Total Records */}
                        {totalPages > 0 && (
                            <div className="flex items-center justify-between mt-4">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span>
                                        {' '}to{' '}
                                        <span className="font-medium">{Math.min(currentPage * recordsPerPage, allRecords.length)}</span>
                                        {' '}of{' '}
                                        <span className="font-medium">{allRecords.length}</span> results
                                    </p>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex items-center">
                                        <button
                                            onClick={goToPrevPage}
                                            disabled={currentPage === 1}
                                            className="cursor-pointer px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="mx-4 text-sm text-gray-700">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={goToNextPage}
                                            disabled={currentPage === totalPages}
                                            className="cursor-pointer px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AllRecords;
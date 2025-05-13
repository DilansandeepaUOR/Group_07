import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaCalendarAlt, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

const AllRecords = () => {
  const [allRecords, setAllRecords] = useState([]); // Store all records
  const [displayedRecords, setDisplayedRecords] = useState([]); // Records to display
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [years, setYears] = useState([]);
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Fetch all records and available years on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, yearsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/all-records'),
          axios.get('http://localhost:3001/api/record-years')
        ]);
        
        setAllRecords(recordsRes.data);
        setYears(yearsRes.data);
        updateDisplayedRecords(recordsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update displayed records when filters or pagination changes
  const updateDisplayedRecords = (records) => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    setDisplayedRecords(records.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(records.length / recordsPerPage));
  };

  // Apply filters when they change
  const applyFilters = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/filtered-records', {
        searchTerm,
        year: filters.year,
        month: filters.month,
        date: filters.date
      });
      setAllRecords(response.data);
      setCurrentPage(1); // Reset to first page when filters change
      updateDisplayedRecords(response.data);
    } catch (error) {
      console.error('Error filtering records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      month: '',
      date: ''
    });
    setSearchTerm('');
    // Refetch all records when clearing filters
    setLoading(true);
    axios.get('http://localhost:3001/api/all-records')
      .then(res => {
        setAllRecords(res.data);
        setCurrentPage(1); // Reset to first page
        updateDisplayedRecords(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Delete record function
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`http://localhost:3001/api/delete-record/${id}`);
        // Refresh the records after deletion
        const response = await axios.get('http://localhost:3001/api/all-records');
        setAllRecords(response.data);
        updateDisplayedRecords(response.data);
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record');
      }
    }
  };

  // Pagination functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Update displayed records when page changes
  useEffect(() => {
    updateDisplayedRecords(allRecords);
  }, [currentPage, allRecords]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Medical Records</h1>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by owner or pet name..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <form onSubmit={handleFilterSubmit} className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Years</option>
                  {years.map(y => (
                    <option key={y.year} value={y.year}>{y.year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Months</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Clear all
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
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
            <p className="mt-2 text-gray-600">No records found in the system</p>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
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
                        {record.surgery && <p><span className="font-medium">Surgery:</span> {record.surgery}</p>}
                        {(record.vaccine_name || record.other_vaccine) && (
                          <div className="mt-1">
                            <span className="font-medium">Vaccination:</span>
                            <div className="ml-2">
                              {record.vaccine_type === 'core' && (
                                <p>Core Vaccine: {record.vaccine_name}</p>
                              )}
                              {record.vaccine_type === 'lifestyle' && (
                                <p>Lifestyle Vaccine: {record.vaccine_name}</p>
                              )}
                              {record.other_vaccine && (
                                <p>Other Vaccine: {record.other_vaccine}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {record.other && <p><span className="font-medium">Notes:</span> {record.other}</p>}
                        {record.vaccination_notes && <p className="mt-1"><span className="font-medium">Vaccination Notes:</span> {record.vaccination_notes}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/records/edit/${record.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * recordsPerPage, allRecords.length)}</span> of{' '}
                    <span className="font-medium">{allRecords.length}</span> records
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Previous</span>
                      <FaChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Next</span>
                      <FaChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllRecords;
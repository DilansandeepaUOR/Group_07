import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

const AllRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [years, setYears] = useState([]);
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();


  // Fetch all records and available years on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, yearsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/all-records'),  // Changed to GET
          axios.get('http://localhost:3001/api/record-years')
        ]);
        
        setRecords(recordsRes.data);
        setYears(yearsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
      setRecords(response.data);
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
        setRecords(res.data);
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
    // ... rest of the months
    { value: '12', label: 'December' }
  ];

  const handleClose = () => {
    navigate(-1);
  };

  // Delete record function
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`http://localhost:3001/api/delete-record/${id}`);
        // Refresh the records after deletion
        const response = await axios.get('http://localhost:3001/api/all-records');
        setRecords(response.data);
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record');
      }
    }
  };


  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md relative">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <FaTimes size={24} />
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">All Medical Records</h1>

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
        ) : records.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FaCalendarAlt className="mx-auto text-gray-400 text-4xl" />
            <p className="mt-2 text-gray-600">No records found in the system</p>
          </div>
        ) : (
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
              {records.map((record) => (
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
                      {record.vaccination && <p><span className="font-medium">Vaccination:</span> {record.vaccination}</p>}
                      {record.other && <p><span className="font-medium">Notes:</span> {record.other}</p>}
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
        )}
      </div>
    </div>
  );
};

export default AllRecords;
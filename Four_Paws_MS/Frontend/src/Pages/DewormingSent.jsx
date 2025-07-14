import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const DewormingSent = () => {
    // --- State Management ---
    const [allNotifications, setAllNotifications] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --- State for Search and Filters ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ year: '', month: '', date: '' });
    const [years, setYears] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);
    
    // --- State for Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // --- Data Fetching and Processing ---
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/api/deworming-notifications/deworming-notification-history');
            const data = response.data;
            setAllNotifications(data);
            setNotifications(data);

            const uniqueYears = [...new Set(data.map(item => new Date(item.sent_date).getFullYear()))];
            setYears(uniqueYears.sort((a, b) => b - a));

        } catch (error) {
            console.error('Error fetching deworming notifications:', error);
            setNotifications([]); 
        } finally {
            setLoading(false);
        }
    };

    // --- Search and Filter Logic ---
    const applyFilters = () => {
        let filteredData = [...allNotifications];

        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                item.Pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.Owner_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.year) {
            filteredData = filteredData.filter(item => new Date(item.sent_date).getFullYear() === parseInt(filters.year));
        }
        if (filters.month) {
            filteredData = filteredData.filter(item => new Date(item.sent_date).getMonth() + 1 === parseInt(filters.month));
        }
        if (filters.date) {
            filteredData = filteredData.filter(item => item.sent_date.split('T')[0] === filters.date);
        }

        setNotifications(filteredData);
        setIsFiltered(true);
        setCurrentPage(1);
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilters({ year: '', month: '', date: '' });
        setNotifications(allNotifications);
        setIsFiltered(false);
        setCurrentPage(1);
    };

    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await axios.post('http://localhost:3001/api/deworming-notifications/trigger-deworming-notifications-dogs');
            await axios.post('http://localhost:3001/api/cat-deworming-notifications/trigger-deworming-notifications-cats');
            await fetchNotifications();
            clearAllFilters();
        } catch (error) {
            console.error('Error during refresh:', error);
            alert('Failed to refresh deworming notifications.');
        } finally {
            setIsRefreshing(false);
        }
    };

    // --- Helper constants and functions ---
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('en', { month: 'long' }) }));
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US');

    // --- Pagination Logic ---
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = notifications.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(notifications.length / rowsPerPage);

    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl"><strong>Note: </strong><span className="text-red-600">Click refresh to see the latest notifications.</span></h1>
                <button onClick={handleRefresh} disabled={isRefreshing} className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* --- Filter and Search Section --- */}
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
                            className="pl-10 pr-10 w-full p-2 border rounded-md"
                        />
                        {searchTerm && (
                            <button onClick={clearAllFilters} className="absolute right-3 top-1/2 -translate-y-1/2" title="Clear">
                                <FaTimes className="text-gray-500 hover:text-gray-700" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                        {searchTerm.trim() ? (
                                <button 
                                    onClick={applyFilters} 
                                    className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-150"
                                >
                                    <FaSearch /> Search
                                </button>
                            ) : (
                                <span className="flex items-center gap-2 bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed">
                                    <FaSearch /> Search
                                </span>
                            )}
                            <button 
                                onClick={() => setShowFilters(!showFilters)} 
                                className="cursor-pointer flex items-center gap-2 bg-white border px-4 py-2 rounded-md hover:bg-gray-100"
                            >
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
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
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

            {/* --- Records Table --- */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div></div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="mt-2 text-gray-600">{isFiltered ? "No notifications match your filters." : "No deworming notifications have been sent yet."}</p>
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deworming Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentRows.map((notification) => (
                                    <tr key={notification.notification_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{notification.Pet_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{notification.Owner_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{notification.deworm_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(notification.sent_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-6 inline-flex text-md leading-5 font-semibold rounded-full ${
                                                notification.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {notification.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* --- Pagination Controls --- */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to <span className="font-medium">{Math.min(indexOfLastRow, notifications.length)}</span> of <span className="font-medium">{notifications.length}</span> results
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <button onClick={goToPrevPage} disabled={currentPage === 1} className="cursor-pointer px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                        Previous
                                    </button>
                                    <span className="mx-4 text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button onClick={goToNextPage} disabled={currentPage === totalPages} className="cursor-pointer px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DewormingSent;
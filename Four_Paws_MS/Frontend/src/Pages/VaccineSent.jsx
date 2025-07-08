import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VaccineSent = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // --- State for Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/api/notifications/notification-history');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setCurrentPage(1); // Reset to the first page on refresh
        try {
            await axios.post('http://localhost:3001/api/notifications/trigger-notifications');
            await fetchNotifications();
        } catch (error) {
            console.error('Error during refresh:', error);
            alert('Failed to refresh notifications.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    // --- Pagination Logic ---
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = notifications.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(notifications.length / rowsPerPage);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1><strong>Note: </strong><text style={{ color: 'red' }}>Please click the refresh button to see the latest notifications</text>.</h1>
                <button onClick={handleRefresh} disabled={isRefreshing} style={styles.button}>
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            {/* ... table headers ... */}
                             <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={styles.th}>Pet Name</th>
                            <th style={styles.th}>Owner</th>
                           <th style={styles.th}>Vaccine</th>
                           <th style={styles.th}>Sent Date</th>
                           <th style={styles.th}>Status</th>
                           <th style={styles.th}>Subject</th>
                         </tr>
                        </thead>
                        <tbody>
                            {/* Map over the rows for the current page */}
                            {currentRows.map((notification) => (
                                <tr key={notification.notification_id} style={styles.tr}>
                                    <td style={styles.td}>{notification.Pet_name}</td>
                                    <td style={styles.td}>{notification.Owner_name}</td>
                                    <td style={styles.td}>{notification.template_name}</td>
                                    <td style={styles.td}>{formatDate(notification.sent_date)}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: notification.status === 'sent' ? '#e6f7e6' : '#fde2e2',
                                            color: notification.status === 'sent' ? '#2e7d32' : '#d32f2f'
                                        }}>
                                            {notification.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{notification.subject}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* --- Pagination Controls --- */}
                    <div style={styles.pagination}>
                        <button 
                             
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                            disabled={currentPage === 1}
                            className="cursor-pointer px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span style={{ margin: '0 15px' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                            disabled={currentPage === totalPages}
                            className="cursor-pointer px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// --- Styles ---
const styles = {
    th: {
        padding: '12px',
        textAlign: 'left',
        borderBottom: '2px solid #ddd',
    },
    td: {
        padding: '12px',
        borderBottom: '1px solid #ddd',
    },
    tr: {
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    button: {
        padding: '10px 15px',
        fontSize: '14px',
        cursor: 'pointer',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
    },
    pagination: {
        marginTop: '20px',
        textAlign: 'right',
    }
};

export default VaccineSent;
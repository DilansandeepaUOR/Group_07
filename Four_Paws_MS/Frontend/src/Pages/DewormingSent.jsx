import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DewormingSent = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // --- State for Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Fetch initial data on component mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Updated API endpoint for deworming history
            const response = await axios.get('http://localhost:3001/api/deworming-notifications/deworming-notification-history');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching deworming notifications:', error);
            // Set notifications to an empty array on error to avoid crash
            setNotifications([]); 
        } finally {
            setLoading(false);
        }
    };

    // Handle the refresh button click
    const handleRefresh = async () => {
        setIsRefreshing(true);
        setCurrentPage(1); // Reset to the first page on refresh
        try {
            // Updated API endpoint to trigger deworming notifications
            await axios.post('http://localhost:3001/api/deworming-notifications/trigger-deworming-notifications');
            // Fetch the updated history
            await fetchNotifications();
        } catch (error) {
            console.error('Error during refresh:', error);
            alert('Failed to refresh deworming notifications.');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
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
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{fontSize: '1.2rem'}}><strong>Note: </strong><span style={{ color: 'red' }}>Click the refresh button to check for and send new deworming reminders.</span></h1>
                <button onClick={handleRefresh} disabled={isRefreshing} style={styles.button}>
                    {isRefreshing ? 'Refreshing...' : 'Refresh & Send'}
                </button>
            </div>

            {loading ? (
                <div>Loading History...</div>
            ) : (
                <>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                             <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={styles.th}>Pet Name</th>
                                <th style={styles.th}>Owner</th>
                                <th style={styles.th}>Deworming Task</th>
                                <th style={styles.th}>Sent Date</th>
                                <th style={styles.th}>Status</th>
                             </tr>
                        </thead>
                        <tbody>
                            {currentRows.length > 0 ? currentRows.map((notification) => (
                                <tr key={notification.notification_id} style={styles.tr}>
                                    <td style={styles.td}>{notification.Pet_name}</td>
                                    <td style={styles.td}>{notification.Owner_name}</td>
                                    <td style={styles.td}>{notification.deworm_name}</td>
                                    <td style={styles.td}>{formatDate(notification.sent_date)}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: notification.status === 'sent' ? '#e6f7e6' : '#fde2e2',
                                            color: notification.status === 'sent' ? '#2e7d32' : '#d32f2f',
                                            fontWeight: 'bold'
                                        }}>
                                            {notification.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{...styles.td, textAlign: 'center', padding: '20px'}}>No deworming notifications have been sent yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {notifications.length > rowsPerPage && (
                         <div style={styles.pagination}>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                disabled={currentPage === 1}
                                style={styles.pageButton}
                            >
                                Previous
                            </button>
                            <span style={{ margin: '0 15px', color: '#333' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                disabled={currentPage === totalPages}
                                style={styles.pageButton}
                            >
                                Next
                            </button>
                        </div>
                    )}
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
        backgroundColor: '#f8f9fa'
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
        padding: '10px 20px',
        fontSize: '14px',
        cursor: 'pointer',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
    },
    pagination: {
        marginTop: '20px',
        textAlign: 'right',
    },
    pageButton: {
        cursor: 'pointer',
        padding: '8px 12px',
        margin: '0 5px',
        fontSize: '14px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fff',
    }
};

export default DewormingSent;

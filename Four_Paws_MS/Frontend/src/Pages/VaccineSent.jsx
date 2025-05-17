import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VaccineSent = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/notifications/notification-history');
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Vaccine Notification History</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
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
          {notifications.map((notification) => (
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
    </div>
  );
};

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
};

export default VaccineSent;
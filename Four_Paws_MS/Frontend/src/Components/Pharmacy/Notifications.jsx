import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(5);
  const [totalNotifications, setTotalNotifications] = useState(0);

  // Color scheme
  const colors = {
    darkBackground: 'rgba(34,41,47,255)',       // Dark slate
    tealAccent: 'rgba(59,205,191,255)',        // Bright teal
    yellowAccent: '#FFD700',                    // Gold yellow
    lightText: '#f3f4f6',                      // Light gray text
    darkText: '#111827',                       // Dark text
    unreadHighlight: 'rgba(59,205,191,0.1)'    // Teal highlight
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:3001/pharmacy/api/notifications');
        setNotifications(response.data);
        setTotalNotifications(response.data.length);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/pharmacy/api/notifications/${id}/read`);
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('http://localhost:3001/pharmacy/api/notifications/mark-all-read');
      setNotifications(notifications.map(notification => 
        ({ ...notification, is_read: true })
      ));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const loadMore = () => {
    setDisplayCount(prevCount => Math.min(prevCount + 10, 15));
  };

  if (loading) {
    return <div style={{ color: colors.lightText }}>Loading notifications...</div>;
  }

  const displayedNotifications = notifications.slice(0, displayCount);

  return (
    <>
      <h1 style={{ 
        fontSize: "1.5rem", 
        fontWeight: "bold", 
        marginBottom: "16px",
        color: colors.yellowAccent
      }}>
        Notifications
      </h1>
      
      <div style={{
        backgroundColor: colors.darkBackground,
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        border: `1px solid ${colors.tealAccent}`
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginBottom: "16px", 
          alignItems: "center" 
        }}>
          <h2 style={{ 
            fontWeight: "600",
            color: colors.lightText
          }}>
            Recent Notifications
          </h2>
          <button
            onClick={markAllAsRead}
            style={{
              backgroundColor: colors.tealAccent,
              color: colors.darkText,
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
              ':hover': {
                opacity: 0.9
              }
            }}
          >
            Mark all as read
          </button>
        </div>
        
        <div>
          {displayedNotifications.length === 0 ? (
            <div style={{ 
              padding: "16px", 
              textAlign: "center",
              color: colors.lightText
            }}>
              No notifications available
            </div>
          ) : (
            displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: "12px",
                  borderBottom: `1px solid ${colors.tealAccent}`,
                  backgroundColor: notification.is_read ? "transparent" : colors.unreadHighlight,
                  borderLeft: notification.is_read ? "none" : `3px solid ${colors.yellowAccent}`,
                  marginBottom: "8px",
                  borderRadius: "4px",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3 style={{ 
                    fontWeight: "600", 
                    marginBottom: "4px",
                    color: notification.is_read ? colors.lightText : colors.yellowAccent
                  }}>
                    {notification.title}
                  </h3>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    color: colors.tealAccent
                  }}>
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ 
                  color: colors.lightText, 
                  marginBottom: "8px",
                  fontSize: "0.875rem"
                }}>
                  {notification.description}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    style={{
                      backgroundColor: colors.tealAccent,
                      color: colors.darkText,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "none",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      fontWeight: "500"
                    }}
                  >
                    View
                  </button>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      style={{
                        backgroundColor: colors.yellowAccent,
                        color: colors.darkText,
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: "500"
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > displayCount && displayCount < 15 && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              onClick={loadMore}
              style={{
                backgroundColor: colors.yellowAccent,
                color: colors.darkText,
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Load more ({Math.min(10, 15 - displayCount)} more)
            </button>
          </div>
        )}
        
        {displayCount >= 15 && totalNotifications > 15 && (
          <div style={{ 
            textAlign: "center", 
            marginTop: "16px", 
            color: colors.tealAccent, 
            fontSize: "0.875rem" 
          }}>
            Showing 15 of {totalNotifications} notifications
          </div>
        )}
      </div>
    </>
  );
}
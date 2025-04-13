import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:3001/pharmacy/api/notifications');
        setNotifications(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Optional: Set up polling for updates
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `http://localhost:3001/pharmacy/api/notifications/${id}/read`
      );
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        'http://localhost:3001/pharmacy/api/notifications/mark-all-read'
      );
      setNotifications(notifications.map(notification => 
        ({ ...notification, is_read: true })
      ));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "16px" }}>Notifications</h1>
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
          <h2 style={{ fontWeight: "600" }}>Recent Notifications</h2>
          <button
            onClick={markAllAsRead}
            style={{
              backgroundColor: "#f3f4f6",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Mark all as read
          </button>
        </div>
        <div>
          {notifications.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center" }}>No notifications available</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: notification.is_read ? "transparent" : "#f3f4f6",
                  borderLeft: notification.is_read ? "none" : "3px solid #4f46e5",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3 style={{ fontWeight: "600", marginBottom: "4px" }}>{notification.title}</h3>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ color: "#4b5563", marginBottom: "8px" }}>{notification.description}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.75rem",
                        cursor: "pointer",
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
        {notifications.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              style={{
                backgroundColor: "#f9fafb",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </>
  );
}
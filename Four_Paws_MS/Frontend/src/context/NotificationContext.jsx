import { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Poll for notifications every 10 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:3001/pharmacy/api/notifications");
        const data = await res.json();
        setNotifications(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading }}>
      {children}
    </NotificationContext.Provider>
  );
} 
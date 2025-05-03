"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Bell, BellOff, CheckCircle } from "lucide-react";

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(5);
  const [totalNotifications, setTotalNotifications] = useState(0);

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
    setDisplayCount(prevCount => Math.min(prevCount + 5, 15));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] p-6">
        <div className="max-w-7xl mx-auto text-center text-gray-800">
          Loading notifications...
        </div>
      </div>
    );
  }

  const displayedNotifications = notifications.slice(0, displayCount);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <Button
            className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="mr-2 w-4 h-4" />
            Mark all as read
          </Button>
        </div>

        <div className="bg-white/30 backdrop-blur-md rounded-lg shadow-lg p-6 border border-[#71C9CE]">
          {displayedNotifications.length === 0 ? (
            <div className="p-6 text-center text-gray-700 flex flex-col items-center">
              <BellOff className="w-8 h-8 mb-2 text-gray-500" />
              No notifications available
            </div>
          ) : (
            <div className="space-y-3">
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg transition-all ${
                    !notification.is_read 
                      ? 'bg-yellow-50/70 border-l-4 border-yellow-500 shadow-sm' 
                      : 'bg-white/50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${
                      !notification.is_read ? 'text-yellow-800' : 'text-gray-800'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">
                    {notification.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      View details
                    </Button>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-800"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {notifications.length > displayCount && displayCount < 15 && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                className="border-[#71C9CE] text-[#71C9CE] hover:bg-[#71C9CE]/10"
              >
                Load more ({Math.min(5, 15 - displayCount)} more)
              </Button>
            </div>
          )}

          {displayCount >= 15 && totalNotifications > 15 && (
            <div className="text-center mt-4 text-sm text-gray-600">
              Showing 15 of {totalNotifications} notifications
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
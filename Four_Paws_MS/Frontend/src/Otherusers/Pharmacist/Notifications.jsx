"use client"

import { useState, useEffect } from 'react';
import { Button } from "../../Components/ui/button";
import { Bell, BellOff, CheckCircle, X } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

export default function NotificationsSection({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onRefresh 
}) {
  const [displayCount, setDisplayCount] = useState(5);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotifications, setShowNotifications] = useState(true); // toggle for notification list
  const { unreadCount } = useNotification();

  // Add polling for notifications
  useEffect(() => {
    // Initial fetch
    onRefresh();

    // Set up polling interval (every 10 seconds)
    const pollInterval = setInterval(() => {
      onRefresh();
    }, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, [onRefresh]);

  const loadMore = () => {
    setDisplayCount(prevCount => Math.min(prevCount + 5, 15));
  };

  const viewDetails = (notification) => {
    setSelectedNotification(notification);
    // Mark as read when viewing details
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const closeDetails = () => {
    setSelectedNotification(null);
  };

  if (!notifications) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] p-6">
        <div className="max-w-7xl mx-auto text-center text-gray-800">
          Loading notifications...
        </div>
      </div>
    );
  }

  const displayedNotifications = notifications.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notification Bell with Count */}
        <div className="flex justify-end mb-4">
          <button
            className="relative focus:outline-none"
            onClick={() => setShowNotifications(v => !v)}
            aria-label="Show notifications"
          >
            <Bell className="w-8 h-8 text-[#71C9CE]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification List */}
        {showNotifications && (
          <>
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
              <div className="flex gap-2">
                <Button
                  className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                  onClick={onMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </Button>
              </div>
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
                          onClick={() => viewDetails(notification)}
                        >
                          View details
                        </Button>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-800"
                            onClick={() => onMarkAsRead(notification.id)}
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

              {displayCount >= 15 && notifications.length > 15 && (
                <div className="text-center mt-4 text-sm text-gray-600">
                  Showing 15 of {notifications.length} notifications
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fadeIn scale-100 p-0">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-[#222] flex-1 truncate">
                  {selectedNotification.title}
                </h2>
                <button 
                  onClick={closeDetails}
                  className="ml-4 text-gray-400 hover:text-red-500 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-[#71C9CE]"
                  aria-label="Close notification details"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Date: <span className="font-medium text-gray-700">{new Date(selectedNotification.created_at).toLocaleString()}</span></span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                    selectedNotification.is_read 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {selectedNotification.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E0E7EF] text-gray-800 shadow-sm">
                  <p className="whitespace-pre-line leading-relaxed">{selectedNotification.description}</p>
                </div>
                {selectedNotification.metadata && (
                  <div className="space-y-2 mt-2">
                    <h3 className="font-semibold text-gray-700 text-base mb-1">Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-2 rounded border border-gray-100">
                          <span className="font-medium text-gray-600">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
                <Button
                  variant="outline"
                  className="rounded-lg px-4 py-2 border-[#71C9CE] text-[#71C9CE] hover:bg-[#71C9CE]/10"
                  onClick={closeDetails}
                >
                  Close
                </Button>
                {selectedNotification.action_url && (
                  <Button
                    className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 rounded-lg px-4 py-2"
                    onClick={() => window.open(selectedNotification.action_url, '_blank')}
                  >
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import API from "../services/api";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    // Optionally poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/notifications/my");
      // Sort by date, most recent first
      const sorted = (data || []).sort((a, b) => new Date(b.sendDate) - new Date(a.sendDate));
      setNotifications(sorted);
      setError("");
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      // Mark as read
      await API.patch(`/notifications/read/${notificationId}`);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "read" } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.patch("/notifications/read");
      // Update all notifications to read
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "read" }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  // Format time ago
  const timeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative text-gray-400 hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
        title="Notifications"
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden animate-slideUp z-50">
          
          {/* Header */}
          <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-gray-400 text-xs">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && !notifications.length ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                <p className="text-gray-400 text-sm mt-2">Loading...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-red-400 text-sm">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification._id)}
                  className={`px-4 py-3 border-b border-gray-700 cursor-pointer transition-colors ${
                    notification.status === "unread"
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-800 hover:bg-gray-750"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold text-sm">
                          {notification.title}
                        </h4>
                        {notification.status === "unread" && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-300 text-xs mt-1">
                        {notification.body}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          notification.type === "emergency_alert"
                            ? "bg-red-900 text-red-200"
                            : notification.type === "complaint_update"
                            ? "bg-blue-900 text-blue-200"
                            : "bg-gray-700 text-gray-300"
                        }`}>
                          {notification.type === "emergency_alert" ? "🚨 Alert" : 
                           notification.type === "complaint_update" ? "📋 Update" : 
                           "📌 General"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {timeAgo(notification.sendDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-900 border-t border-gray-700 px-4 py-2 text-center">
              <button className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-colors">
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          onClick={() => setShowDropdown(false)}
          className="fixed inset-0 z-40"
        ></div>
      )}
    </div>
  );
}

export default NotificationDropdown;

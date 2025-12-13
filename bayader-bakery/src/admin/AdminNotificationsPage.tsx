import React, { useState, useEffect } from "react";
import { Bell, Trash2, CheckCircle } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "alert" | "info" | "warning" | "success" | "error";
  category: string;
  read: boolean;
  createdAt: string;
  action?: {
    url: string;
    label: string;
  };
}

interface Toast {
  type: "success" | "error" | "info";
  message: string;
}

const Toast: React.FC<{ type: "success" | "error" | "info"; message: string; onClose: () => void }> = ({
  type,
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`}>
      {message}
    </div>
  );
};

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/notifications/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setToast({ type: "error", message: "Failed to load notifications" });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    console.log('[FRONTEND-MARK] 🔵 markAsRead() called for:', notificationId);
    try {
      console.log('[FRONTEND-MARK] 🔵 Sending PUT request to:', `/api/notifications/${notificationId}/read`);
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log('[FRONTEND-MARK] 🔵 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('[FRONTEND-MARK] ❌ Response not ok:', errorText);
        throw new Error("Failed to mark as read");
      }

      const data = await response.json();
      console.log('[FRONTEND-MARK] ✅ Response data:', data);

      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );

      setToast({ type: "success", message: "Marked as read" });
    } catch (err) {
      console.log('[FRONTEND-MARK] ❌ Error:', err);
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update",
      });
    }
  };

  const markAllAsRead = async () => {
    console.log('[FRONTEND-MARK-ALL] 🔵 markAllAsRead() called');
    try {
      console.log('[FRONTEND-MARK-ALL] 🔵 Sending PUT request to: /api/notifications/mark-all/read');
      const response = await fetch("/api/notifications/mark-all/read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log('[FRONTEND-MARK-ALL] 🔵 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[FRONTEND-MARK-ALL] ❌ Response not ok:', errorText);
        throw new Error("Failed to mark all as read");
      }

      const data = await response.json();
      console.log('[FRONTEND-MARK-ALL] ✅ Response data:', data);

      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setToast({ type: "success", message: "All marked as read" });
    } catch (err) {
      console.log('[FRONTEND-MARK-ALL] ❌ Error:', err);
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      setNotifications(notifications.filter((n) => n._id !== notificationId));
      setToast({ type: "success", message: "Notification deleted" });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "error":
      case "alert":
        return <Bell className="w-6 h-6 text-red-600" />;
      case "warning":
        return <Bell className="w-6 h-6 text-yellow-600" />;
      default:
        return <Bell className="w-6 h-6 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (read: boolean) => {
    return read ? "bg-white" : "bg-blue-50";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#5E372E] flex items-center">
              <Bell className="w-8 h-8 mr-3 text-blue-600" />
              Notifications
            </h1>
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          <p className="text-gray-600">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notifications yet</p>
            <p className="text-gray-400">
              You'll see notifications about orders, custom requests, and system alerts here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border border-gray-200 transition-all ${getNotificationBgColor(
                  notification.read
                )} hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-gray-700 mt-1">
                          {notification.message}
                        </p>
                        {(notification as any).actorName && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">By:</span> {(notification as any).actorName}
                          </p>
                        )}
                      </div>
                      {!notification.read && (
                        <span className="flex-shrink-0 ml-2 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}{" "}
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="text-sm px-3 py-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          type={toast.type as "success" | "error" | "info"}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AdminNotificationsPage;

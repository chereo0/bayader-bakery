import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertCircle, Info } from "lucide-react";
import Toast from "./Toast";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: string; message: string } | null>(
    null
  );

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/notifications/me", {
        method: "GET",
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
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );

      setToast({ type: "success", message: "Marked as read" });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all/read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all as read");
      }

      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      // Immediately refresh unread badge
      window.dispatchEvent(new Event('notifications-updated'))
      setToast({ type: "success", message: "All marked as read" });
    } catch (err) {
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

      setNotifications(
        notifications.filter((n) => n._id !== notificationId)
      );

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
      case "order":
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case "booking":
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      case "custom-order":
        return <Info className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
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
              You'll see notifications about orders, bookings, and custom requests here.
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
}

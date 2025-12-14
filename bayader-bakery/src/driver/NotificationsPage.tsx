import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { socketService } from '../services/socketService'

interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'success' | 'alert' | 'error'
  category: 'order' | 'delivery' | 'system' | 'message'
  priority: 'normal' | 'high' | 'urgent'
  read: boolean
  createdAt: string
  action?: {
    url: string
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'orders' | 'delivery' | 'messages' | 'system'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()

    // Listen for real-time notifications
    const handleNewNotification = (notification: any) => {
      console.log('[NotificationsPage] New notification received:', notification)
      // Add new notification to the top of the list
      setNotifications(prev => [notification, ...prev])
    }

    socketService.on('notification', handleNewNotification)

    return () => {
      socketService.off('notification', handleNewNotification)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch(`${API_BASE_URL}/notifications/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      setNotifications(data.data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to mark as read')
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      )
      toast.success('Marked as read')
    } catch (err: any) {
      toast.error('Failed to mark as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
      toast.success('Notification deleted')
    } catch (err: any) {
      toast.error('Failed to delete notification')
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id)

      await Promise.all(
        unreadIds.map(id =>
          fetch(`${API_BASE_URL}/notifications/${id}/read`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        )
      )

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (err: any) {
      toast.error('Failed to mark all as read')
    }
  }

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications
    if (filter === 'orders') return notifications.filter(n => n.category === 'order')
    if (filter === 'delivery') return notifications.filter(n => n.category === 'delivery')
    if (filter === 'messages') return notifications.filter(n => n.category === 'message')
    if (filter === 'system') return notifications.filter(n => n.category === 'system')
    return notifications
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'alert': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'order': return '📦'
      case 'delivery': return '🚚'
      case 'message': return '💬'
      case 'system': return '⚙️'
      default: return '📋'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifications = getFilteredNotifications()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5E372E]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#5E372E]">Notifications</h1>
            <p className="text-sm text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-[#5E372E] text-white rounded-lg hover:bg-[#4a2c24] transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'orders', 'delivery', 'messages', 'system'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-[#5E372E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 text-lg">No notifications to display</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <div
              key={notification._id}
              className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${
                notification.read ? 'border-gray-200' : 'border-amber-400 bg-amber-50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">
                  {getCategoryIcon(notification.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-[#5E372E] flex items-center gap-2">
                      {notification.title}
                      {!notification.read && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-2">{notification.message}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                    {notification.action?.url && (
                      <a
                        href={notification.action.url}
                        className="text-xs text-[#5E372E] hover:text-[#4a2c24] font-medium"
                      >
                        View Details →
                      </a>
                    )}
                  </div>
                </div>

                {/* Type Badge */}
                <div className="flex-shrink-0">
                  <span className="text-lg">{getTypeIcon(notification.type)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage

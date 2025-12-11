import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface StatsCard {
  label: string
  value: number | string
  subtext?: string
  icon: React.ReactNode
}

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  category?: string
  createdAt: string
  priority?: 'low' | 'normal' | 'high'
}

interface StaffOverviewProps {
  onSelectTab?: (tabName: string) => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('token')

const StaffOverview: React.FC<StaffOverviewProps> = ({ onSelectTab }) => {
  const [stats, setStats] = useState<any>(null)
  const [reminders, setReminders] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    fetchReminders()
  }, [])

  const fetchStats = async () => {
    try {
      const token = getToken()
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        setStats(response.data.data)
        setError(null)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const token = getToken()
      if (!token) {
        console.warn('[StaffOverview] No token found, skipping reminders fetch')
        setLoading(false)
        return
      }

      // Fetch notifications with reminder category from admin
      const response = await axios.get(`${API_BASE_URL}/notifications?type=alert`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success && response.data.data) {
        // Take only the most recent 3 reminders
        const reminders = Array.isArray(response.data.data) ? response.data.data.slice(0, 3) : []
        setReminders(reminders)
        console.log('[StaffOverview] ✅ Fetched reminders:', reminders.length)
      } else {
        console.log('[StaffOverview] No reminders found')
        setReminders([])
      }
    } catch (err) {
      console.error('[StaffOverview] Error fetching reminders:', err)
      // Don't set error state - reminders are optional
      setReminders([])
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-l-4 border-red-400'
      case 'normal':
        return 'bg-blue-50 border-l-4 border-blue-400'
      case 'low':
        return 'bg-green-50 border-l-4 border-green-400'
      default:
        return 'bg-yellow-50 border-l-4 border-yellow-400'
    }
  }

  const getPriorityTextColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-800'
      case 'normal':
        return 'text-blue-800'
      case 'low':
        return 'text-green-800'
      default:
        return 'text-yellow-800'
    }
  }

  const StatCard: React.FC<StatsCard> = ({ label, value, subtext, icon }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#c79a63]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-[#5E372E] mt-2">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className="text-[#c79a63] opacity-20 text-4xl">{icon}</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#5E372E]">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to your staff dashboard. Monitor today's activities and upcoming tasks.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c79a63]"></div>
          <p className="text-gray-600 mt-4">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Today's Orders"
              value={stats?.summary?.newOrders || 0}
              icon="📦"
            />
            <StatCard
              label="In Production"
              value={stats?.summary?.inProduction || 0}
              icon="🔧"
            />
            <StatCard
              label="Ready for Dispatch"
              value={stats?.summary?.readyForDispatch || 0}
              icon="✅"
            />
            <StatCard
              label="Pending Tasks"
              value={stats?.summary?.pendingTasks || 0}
              icon="📋"
            />
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#5E372E] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    console.log('[StaffOverview] 🔵 View Today\'s Orders clicked')
                    onSelectTab?.('Orders')
                  }}
                  className="w-full px-4 py-3 bg-[#c79a63] text-white rounded-lg hover:bg-[#b88a52] transition-colors text-left flex items-center gap-3"
                >
                  <span className="text-lg">📋</span>
                  <span>View Today's Orders</span>
                </button>
                <button 
                  onClick={() => {
                    console.log('[StaffOverview] 🔵 Message Admin clicked')
                    onSelectTab?.('Messages')
                  }}
                  className="w-full px-4 py-3 bg-[#d4ac6f] text-white rounded-lg hover:bg-[#c79a63] transition-colors text-left flex items-center gap-3"
                >
                  <span className="text-lg">✉️</span>
                  <span>Message Admin</span>
                </button>
                <button 
                  onClick={() => {
                    console.log('[StaffOverview] 🔵 Upcoming Events clicked')
                    onSelectTab?.('Events')
                  }}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-left flex items-center gap-3"
                >
                  <span className="text-lg">🎉</span>
                  <span>Upcoming Events</span>
                </button>
              </div>
            </div>

            {/* Reminders - Fetched from Backend */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#5E372E] mb-4">Important Reminders</h2>
              {reminders.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
                  <p>No reminders at this time</p>
                  <p className="text-sm text-gray-500 mt-1">Admin will send important reminders here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div key={reminder._id} className={`p-3 rounded ${getPriorityColor(reminder.priority)}`}>
                      <p className={`font-semibold ${getPriorityTextColor(reminder.priority)}`}>
                        {reminder.title}
                      </p>
                      <p className={`text-sm ${getPriorityTextColor(reminder.priority)} opacity-90`}>
                        {reminder.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(reminder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default StaffOverview

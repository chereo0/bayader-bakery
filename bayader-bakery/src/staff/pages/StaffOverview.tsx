import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface StatsCard {
  label: string
  value: number | string
  subtext?: string
  icon: React.ReactNode
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('token')

const StaffOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
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
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
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
                <button className="w-full px-4 py-3 bg-[#c79a63] text-white rounded-lg hover:bg-[#b88a52] transition-colors text-left flex items-center gap-3">
                  <span className="text-lg">📋</span>
                  <span>View Today's Orders</span>
                </button>
                <button className="w-full px-4 py-3 bg-[#d4ac6f] text-white rounded-lg hover:bg-[#c79a63] transition-colors text-left flex items-center gap-3">
                  <span className="text-lg">✉️</span>
                  <span>Message Admin</span>
                </button>
                <button className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-left flex items-center gap-3">
                  <span className="text-lg">🎉</span>
                  <span>Upcoming Events</span>
                </button>
              </div>
            </div>

            {/* Reminders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#5E372E] mb-4">Important Reminders</h2>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="font-semibold text-yellow-800">Quality Check Due</p>
                  <p className="text-sm text-yellow-700">Check materials inventory before end of shift</p>
                </div>
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="font-semibold text-blue-800">Team Meeting</p>
                  <p className="text-sm text-blue-700">3:00 PM - Production team sync</p>
                </div>
                <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                  <p className="font-semibold text-green-800">New Guidelines</p>
                  <p className="text-sm text-green-700">Check messages for updated procedures</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default StaffOverview

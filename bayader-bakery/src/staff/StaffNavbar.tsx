import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bell } from 'lucide-react'

const StaffNavbar: React.FC = () => {
  const [userName, setUserName] = useState<string>('Staff Member')
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserName(user.name || 'Staff Member')
      } catch (e) {
        console.error('Failed to parse user', e)
      }
    }
  }, [])

  // Fetch unread notification count
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/notifications/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        const unread = data.data.filter((n: any) => !n.read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 100)
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#5E372E] dark:text-[#d4a574]">EL-Bayader Staff</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/staff/notifications" className="relative hover:opacity-80 transition-opacity">
            <Bell className="h-6 w-6 text-[#5E372E] dark:text-[#d4a574]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

            <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h12a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0122.5 21h-12a2.25 2.25 0 01-2.25-2.25V15m-3 0l3-3m0 0l-3-3m3 3H2.25" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default StaffNavbar

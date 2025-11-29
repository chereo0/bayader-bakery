import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const StaffNavbar: React.FC = () => {
  const [userName, setUserName] = useState<string>('Staff Member')
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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 100)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#5E372E]">EL-Bayader Staff</h1>
          <p className="text-sm text-gray-600">{userName}</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h12a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0122.5 21h-12a2.25 2.25 0 01-2.25-2.25V15m-3 0l3-3m0 0l-3-3m3 3H2.25" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default StaffNavbar

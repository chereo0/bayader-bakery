import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const DriverNavbar: React.FC = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Navigate to login page
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#6f453f]/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-[#5E372E]">EL-Bayader Driver</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DriverNavbar


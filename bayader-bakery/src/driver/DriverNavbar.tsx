import React from 'react'
import { Link } from 'react-router-dom'

const DriverNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#6f453f]/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-[#5E372E]">EL-Bayader Driver</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-[#5E372E] hover:text-[#7a5a3a] transition-colors">Home</Link>
            <Link to="/#about" className="text-[#5E372E] hover:text-[#7a5a3a] transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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


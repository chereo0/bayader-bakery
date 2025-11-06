import React from 'react'
import { Link } from 'react-router-dom'
import { UserCircleIcon } from '../components/ui/Icon'

const Navbar: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center gap-6">
        <nav className="hidden sm:flex gap-4 text-sm text-[#6b4f45]">
          <Link to="/" className="hover:text-[#5E372E]">Home</Link>
          <Link to="/" className="hover:text-[#5E372E]">About</Link>
          <Link to="/products" className="hover:text-[#5E372E]">Menu</Link>
          <Link to="/contact" className="hover:text-[#5E372E]">Contact</Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 bg-[#6b3f2f] text-white px-3 py-1 rounded">
          <UserCircleIcon className="h-5 w-5" />
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar

import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { WheatIcon } from './ui/Icon'
import Button from './ui/Button'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ShoppingCartIcon } from './ui/Icon'
import { Bell } from 'lucide-react'

export default function Header(){
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { items } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Fetch unread notifications count
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUnreadCount()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  const fetchUnreadCount = async () => {
    console.group('[Notifications] Fetching unread count...')
    try {
      // Step 1: Validate token
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('[Notifications] ⚠️ No auth token in localStorage')
        setUnreadCount(0)
        console.groupEnd()
        return
      }
      console.log('[Notifications] ✓ Token found:', token.substring(0, 20) + '...')

      // Step 2: Make request with explicit headers
      console.log('[Notifications] 📡 Fetching /api/notifications/me...')
      const response = await fetch('/api/notifications/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      })

      // Step 3: Log response status
      console.log(`[Notifications] 📊 Response status: ${response.status} ${response.statusText}`)

      // Step 4: Check if response was successful
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[Notifications] ❌ HTTP ${response.status}`, {
          statusText: response.statusText,
          preview: errorText.substring(0, 500)
        })
        setUnreadCount(0)
        console.groupEnd()
        return
      }

      // Step 5: Validate content-type header before parsing
      const contentType = response.headers.get('content-type')
      console.log(`[Notifications] 📋 Content-Type: ${contentType}`)
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[Notifications] ❌ Invalid content-type', {
          expected: 'application/json',
          received: contentType,
          message: 'Backend returned non-JSON response'
        })
        setUnreadCount(0)
        console.groupEnd()
        return
      }

      // Step 6: Parse JSON safely
      console.log('[Notifications] 🔍 Parsing JSON response...')
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('[Notifications] ❌ JSON.parse() failed', {
          error: parseError.message,
          preview: await response.text().then(t => t.substring(0, 200))
        })
        setUnreadCount(0)
        console.groupEnd()
        return
      }

      // Step 7: Validate response structure
      console.log('[Notifications] ✓ JSON parsed successfully', data)
      
      if (!data.success) {
        console.warn('[Notifications] ⚠️ Response success flag is false', data)
        setUnreadCount(0)
        console.groupEnd()
        return
      }

      if (!Array.isArray(data.data)) {
        console.error('[Notifications] ❌ Response data is not an array', {
          actual: typeof data.data,
          value: data.data
        })
        setUnreadCount(0)
        console.groupEnd()
        return
      }

      // Step 8: Calculate unread count
      const unreadCount = data.data.filter((n: any) => !n.read).length || 0
      setUnreadCount(unreadCount)
      console.log(`[Notifications] ✅ Success! Total: ${data.data.length}, Unread: ${unreadCount}`, {
        notifications: data.data
      })
    } catch (error) {
      // Step 9: Catch unexpected errors
      if (error instanceof SyntaxError) {
        console.error('[Notifications] ❌ Syntax Error (likely JSON parsing)', {
          message: error.message,
          stack: error.stack
        })
      } else if (error instanceof TypeError) {
        console.error('[Notifications] ❌ Network Error', {
          message: error.message,
          stack: error.stack
        })
      } else {
        console.error('[Notifications] ❌ Unexpected Error', error)
      }
      setUnreadCount(0)
    } finally {
      console.groupEnd()
    }
  }

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      setProfileOpen(false)
      // Add a small delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 100)
    }
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-sm bg-bakery-100/80 border-b border-bakery-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* three-column layout: logo | nav(center) | actions */}
        <div className="grid grid-cols-3 items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <WheatIcon className="h-6 w-6 text-bakery-900" />
            <span className="font-display text-xl text-bakery-900">EL-Bayader</span>
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-6" aria-label="Main navigation">
            <button onClick={() => scrollToSection('home')} className="text-bakery-900 hover:text-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-700 transition-colors">Home</button>
            <button onClick={() => scrollToSection('about')} className="text-bakery-900 hover:text-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-700 transition-colors">About</button>
            <Link to="/products" className="text-bakery-900 hover:text-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-700">Menu</Link>
            <Link to="/events" className="text-bakery-900 hover:text-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-700">Events</Link>
            <button onClick={() => scrollToSection('contact')} className="text-bakery-900 hover:text-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-700 transition-colors">Contact</button>
          </nav>

          <div className="flex justify-end items-center gap-3">
            <Link to="/cart" className="relative">
              <ShoppingCartIcon className="h-6 w-6 text-bakery-900" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                  {items.length}
                </span>
              )}
            </Link>
            {isAuthenticated && user && (
              <Link to="/notifications" className="relative">
                <Bell className="h-6 w-6 text-bakery-900" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-bakery-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-bakery-900 text-white flex items-center justify-center font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-bakery-900">Welcome, {user.name.split(' ')[0]}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-bakery-200">
                      <Link
                        to="/notifications"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-bakery-900 hover:bg-bakery-100"
                      >
                        Notifications {unreadCount > 0 && `(${unreadCount})`}
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-bakery-900 hover:bg-bakery-100"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/my-custom-orders"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-bakery-900 hover:bg-bakery-100"
                      >
                        Custom Orders
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-bakery-900 hover:bg-bakery-100"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-bakery-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="hidden md:inline-block"><Button variant="ghost" className="px-4 py-1">Log in</Button></Link>
                  <Link to="/signup" className="hidden md:inline-block"><Button className="px-4 py-1">Sign up</Button></Link>
                </>
              )}
            </div>
            <div className="md:hidden">
              <button aria-label="Toggle menu" onClick={()=> setOpen(s=>!s)} className="p-2 rounded-md focus:ring-2 focus:ring-bakery-700">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4">
          <nav className="flex flex-col gap-2">
            <button onClick={() => { scrollToSection('home'); setOpen(false) }} className="block text-left px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200 transition-colors">Home</button>
            <button onClick={() => { scrollToSection('about'); setOpen(false) }} className="block text-left px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200 transition-colors">About</button>
            <Link to="/products" onClick={()=> setOpen(false)} className="block px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200">Menu</Link>
            <Link to="/events" onClick={()=> setOpen(false)} className="block px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200">Events</Link>
            <button onClick={() => { scrollToSection('contact'); setOpen(false) }} className="block text-left px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200 transition-colors">Contact</button>
            <div className="border-t border-bakery-200 pt-3">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 text-sm text-bakery-900">
                    Welcome, <strong>{user.name.split(' ')[0]}</strong>
                  </div>
                  <Link to="/notifications" onClick={()=> setOpen(false)} className="block px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200">Notifications {unreadCount > 0 && `(${unreadCount})`}</Link>
                  <Link to="/orders" onClick={()=> setOpen(false)} className="block px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200">My Orders</Link>
                  <Link to="/my-custom-orders" onClick={()=> setOpen(false)} className="block px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200">Custom Orders</Link>
                  <Link to="/profile" onClick={()=> setOpen(false)} className="block px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200">My Profile</Link>
                  <button 
                    onClick={() => { handleLogout(); setOpen(false); }} 
                    className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-bakery-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={()=> setOpen(false)} className="block px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200">Log in</Link>
                  <Link to="/signup" onClick={()=> setOpen(false)} className="block mt-2 px-3 py-2 rounded-2xl bg-bakery-900 text-white text-center">Sign up</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface Event {
  _id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  perPersonPrice?: number | null
  isActive: boolean
  image?: string
  venue?: string
}

interface EventBooking {
  _id: string
  eventId: {
    _id: string
    title: string
    date?: string
  }
  customerId: {
    _id: string
    name: string
    email: string
  }
  name: string
  email: string
  phone: string
  peopleCount: number
  dateRequested: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  statusChangedAt?: string
  statusChangedBy?: string
  createdAt: string
}

const StaffEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [bookings, setBookings] = useState<EventBooking[]>([])
  const [activeTab, setActiveTab] = useState<'events' | 'bookings'>('events')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const token = localStorage.getItem('token')

  useEffect(() => {
    loadData()
  }, [retryCount])

  const loadData = () => {
    fetchEvents()
    fetchBookings()
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('[StaffEvents] Fetching events...')
      
      // Use /api proxy instead of full URL
      const response = await axios.get('/api/events/public', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('[StaffEvents] Events loaded:', response.data)
      if (response.data.success) {
        setEvents(response.data.data || [])
      } else {
        setError('Failed to load events: Invalid response format')
      }
    } catch (err: any) {
      const message = err.code === 'ERR_NETWORK' 
        ? 'Cannot connect to server. Please ensure the backend is running on port 5000.'
        : err.response?.data?.message || err.message || 'Failed to load events'
      setError(message)
      console.error('[StaffEvents] fetch failed:', err)
      console.error('[StaffEvents] Error details:', {
        code: err.code,
        message: err.message,
        response: err.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      console.log('[StaffEvents] Fetching bookings...')
      
      // Use /api proxy instead of full URL
      const response = await axios.get('/api/event-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('[StaffEvents] Bookings loaded:', response.data)
      if (response.data.success) {
        setBookings(response.data.data || [])
      }
    } catch (err: any) {
      console.error('[StaffEvents] Failed to fetch bookings:', err)
      // Don't set error state, just log it since bookings are secondary
    }
  }

  const handleRetry = () => {
    console.log('[StaffEvents] Retrying...')
    setRetryCount(prev => prev + 1)
  }

  const handleApprove = async (bookingId: string) => {
    try {
      await axios.patch(`/api/event-bookings/${bookingId}/status`, 
        { status: 'approved' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      // Refresh bookings
      fetchBookings()
    } catch (err: any) {
      console.error('[StaffEvents] Failed to approve booking:', err)
      alert(err.response?.data?.message || 'Failed to approve booking')
    }
  }

  const handleReject = async (bookingId: string) => {
    if (!confirm('Are you sure you want to reject this booking?')) return
    
    try {
      await axios.patch(`/api/event-bookings/${bookingId}/status`,
        { status: 'rejected' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      // Refresh bookings
      fetchBookings()
    } catch (err: any) {
      console.error('[StaffEvents] Failed to reject booking:', err)
      alert(err.response?.data?.message || 'Failed to reject booking')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price?: number | null) => {
    if (!price) return 'Contact for pricing'
    return `$${price.toFixed(2)} per person`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const totalTickets = bookings.reduce((sum, booking) => sum + booking.peopleCount, 0)
  const pendingBookings = bookings.filter(b => b.status === 'pending').length

  console.log('[StaffEvents] Rendering component. Loading:', loading, 'Error:', error, 'Events:', events.length, 'Bookings:', bookings.length)

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#c79a63]">
        <h1 className="text-3xl font-bold text-[#5E372E]">Events & Bookings</h1>
        <p className="text-gray-600 mt-2">View events and manage booking requests</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Error loading events</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-[#c79a63] text-[#5E372E]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-[#c79a63] text-[#5E372E]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bookings ({bookings.length})
            {pendingBookings > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">
                {pendingBookings} pending
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c79a63]"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      ) : (
        <>
          {activeTab === 'events' ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#c79a63]">
              <p className="text-gray-600 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-[#5E372E] mt-2">{events.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <p className="text-gray-600 text-sm font-medium">Active Events</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {events.filter(e => e.isActive).length}
              </p>
            </div>
          </div>

          {/* Events Table */}
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border-l-4 border-gray-200">
              <p className="text-gray-600 text-lg">No events available</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Event Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Price Per Person
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Venue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map(event => (
                      <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-[#5E372E]">{event.title}</p>
                            {event.description && (
                              <p className="text-sm text-gray-600 truncate max-w-xs">{event.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(event.startDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(event.endDate)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-[#c79a63] font-medium">{formatPrice(event.perPersonPrice)}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {event.venue || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              event.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {event.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
            </>
          ) : (
            <>
              {/* Bookings Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#c79a63]">
                  <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-[#5E372E] mt-2">{bookings.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <p className="text-gray-600 text-sm font-medium">Total Tickets Booked</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{totalTickets}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                  <p className="text-gray-600 text-sm font-medium">Pending Requests</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingBookings}</p>
                </div>
              </div>

              {/* Bookings Table */}
              {bookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border-l-4 border-gray-200">
                  <p className="text-gray-600 text-lg">No bookings yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Tickets / Persons
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Date Requested
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bookings.map(booking => (
                          <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-[#5E372E]">{booking.customerId.name}</p>
                                <p className="text-sm text-gray-600">{booking.customerId.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-[#5E372E]">{booking.eventId.title}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="text-2xl font-bold text-[#c79a63]">{booking.peopleCount}</span>
                                <span className="ml-2 text-sm text-gray-600">
                                  {booking.peopleCount === 1 ? 'ticket' : 'tickets'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <p className="text-gray-700">{booking.phone}</p>
                                <p className="text-gray-600">{booking.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {formatDate(booking.dateRequested)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {booking.status === 'pending' ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApprove(booking._id)}
                                    className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(booking._id)}
                                    className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">No actions</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default StaffEventsPage

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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const StaffEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/events/public`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        setEvents(response.data.data || [])
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to load events'
      setError(message)
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#5E372E]">Events</h1>
        <p className="text-gray-600 mt-2">View upcoming events and pricing information</p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c79a63]"></div>
          <p className="text-gray-600 mt-4">Loading events...</p>
        </div>
      ) : (
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
      )}
    </div>
  )
}

export default StaffEventsPage

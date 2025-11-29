import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const token = localStorage.getItem('token') || localStorage.getItem('adminToken')

  useEffect(() => {
    fetchEvents()
  }, [])

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/events`, {
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

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await axios.delete(`${API_BASE_URL}/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      addToast('Event deleted successfully', 'success')
      setEvents(events.filter(e => e._id !== id))
      setDeleteConfirm(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete event'
      addToast(message, 'error')
      console.error('Error deleting event:', err)
    } finally {
      setDeletingId(null)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#5E372E]">Events Management</h1>
          <p className="text-gray-600 mt-2">Manage upcoming events and pricing</p>
        </div>
        <Link
          to="/admin/events/create"
          className="px-4 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b88a52] transition-colors font-medium"
        >
          ➕ Create Event
        </Link>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
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
          {/* Events Table */}
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border-l-4 border-gray-200">
              <p className="text-gray-600 text-lg mb-4">No events yet</p>
              <Link
                to="/admin/events/create"
                className="text-[#c79a63] hover:text-[#b88a52] font-medium"
              >
                Create the first event →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Price Per Person
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
                    {events.map(event => (
                      <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-[#5E372E]">{event.title}</p>
                            {event.venue && <p className="text-sm text-gray-600">{event.venue}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div>
                            <p className="font-medium">{formatDate(event.startDate)}</p>
                            <p className="text-xs text-gray-600">to {formatDate(event.endDate)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-[#c79a63] font-medium">{formatPrice(event.perPersonPrice)}</span>
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
                        <td className="px-6 py-4 text-sm space-x-2">
                          <Link
                            to={`/admin/events/edit/${event._id}`}
                            className="text-[#c79a63] hover:text-[#b88a52] font-medium transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(event._id)}
                            className="text-red-600 hover:text-red-700 font-medium transition-colors"
                          >
                            Delete
                          </button>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-[#5E372E] mb-4">Delete Event?</h3>
            <p className="text-gray-700 mb-6">
              This action cannot be undone. Are you sure you want to delete this event?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={!!deletingId}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                disabled={!!deletingId}
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEventsPage

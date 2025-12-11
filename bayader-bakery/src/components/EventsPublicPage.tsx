import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Card from './ui/Card'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface Event {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  image?: string
  price?: string
  perPersonPrice?: number | null
  venue?: string
  isActive: boolean
  createdAt: string
}

const EventsPublicPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date')
  const [showBooking, setShowBooking] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [bookingData, setBookingData] = useState({ name: '', email: '', guests: 1 })

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    fetchEvents()
  }, [page, search, sortBy])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', ITEMS_PER_PAGE.toString())
      if (search) params.append('search', search)

      const response = await axios.get(`${API_BASE_URL}/events/public?${params.toString()}`)

      if (response.data.success) {
        let eventsList = response.data.data || []

        // Sort by selected criteria
        if (sortBy === 'date') {
          eventsList.sort(
            (a: Event, b: Event) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
        } else if (sortBy === 'price') {
          eventsList.sort((a: Event, b: Event) => {
            const priceA = a.perPersonPrice || 0
            const priceB = b.perPersonPrice || 0
            return priceA - priceB
          })
        }

        setEvents(eventsList)
        setTotalPages(response.data.meta?.totalPages || 1)
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatPrice = (price?: number | null) => {
    if (!price) return 'Contact for pricing'
    return `From $${price.toFixed(2)} per person`
  }

  const handleBooking = (event: Event) => {
    setSelectedEvent(event)
    setShowBooking(true)
  }

  const submitBooking = async () => {
    if (!bookingData.name || !bookingData.email) {
      alert('Please fill in all fields')
      return
    }

    try {
      // Send booking request to backend API
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE_URL}/event-bookings`,
        {
          eventId: selectedEvent?._id,
          name: bookingData.name,
          phone: bookingData.email, // Using email as phone for now
          peopleCount: bookingData.guests,
          dateRequested: new Date().toISOString(),
          message: ''
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      )

      if (response.data.success) {
        alert(
          `✅ Booking Request Submitted!\n\nEvent: ${selectedEvent?.title}\nGuests: ${bookingData.guests}\nWe'll contact you at ${bookingData.email} to confirm.`
        )
        setShowBooking(false)
        setBookingData({ name: '', email: '', guests: 1 })
        setSelectedEvent(null)
      } else {
        alert('❌ Failed to submit booking. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      alert('❌ Error submitting booking. Please try again later.')
    }
  }

  // Single event detail view
  if (id) {
    const event = events.find((e) => e._id === id)

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c79a63] mx-auto mb-4"></div>
            <p className="text-[#6b4f45]">Loading event details...</p>
          </div>
        </div>
      )
    }

    if (!event) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-display text-[#5E372E] mb-2">Event not found</h2>
            <p className="text-[#6b4f45]">The event you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-[#F9F6F2] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8">
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-3xl font-display text-[#5E372E] mb-4">{event.title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 py-4 border-y border-[#d4ac6f]">
              <div>
                <p className="text-sm text-[#6b4f45] opacity-75">Start Date</p>
                <p className="text-lg font-medium text-[#5E372E]">{formatDate(event.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-[#6b4f45] opacity-75">End Date</p>
                <p className="text-lg font-medium text-[#5E372E]">{formatDate(event.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-[#6b4f45] opacity-75">💰 Price Per Person</p>
                <p className="text-lg font-medium text-[#c79a63]">{formatPrice(event.perPersonPrice)}</p>
              </div>
            </div>

            {event.venue && (
              <div className="mb-6">
                <h3 className="font-medium text-[#5E372E] mb-2">📍 Venue</h3>
                <p className="text-[#6b4f45]">{event.venue}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-medium text-[#5E372E] mb-2">📝 About this event</h3>
              <p className="text-[#6b4f45] whitespace-pre-wrap">{event.description}</p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => handleBooking(event)}
                className="flex-1 bg-[#5E372E] text-white py-3 rounded-lg font-medium hover:brightness-90 transition"
              >
                Request Booking
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 border border-[#d4ac6f] text-[#5E372E] py-3 rounded-lg font-medium hover:bg-[#d4ac6f] hover:text-white transition"
              >
                Back to Events
              </button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💳 <strong>Payment:</strong> Cash on Delivery available at the event venue.
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Events listing view
  return (
    <div className="min-h-screen bg-[#F9F6F2] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-display text-[#5E372E] mb-2">🎉 Upcoming Events & Offers</h1>
        <p className="text-[#6b4f45] mb-8">
          Discover our upcoming bakery events, workshops, and special occasions.
        </p>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#5E372E] mb-2">Search events</label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by name, description..."
                className="w-full border border-[#d4ac6f] rounded-lg px-4 py-2 text-[#5E372E] placeholder-[#6b4f45]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5E372E] mb-2">Sort by</label>
              <select
                title="Sort Events"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'price')}
                className="w-full border border-[#d4ac6f] rounded-lg px-4 py-2 text-[#5E372E]"
              >
                <option value="date">📅 Date (Earliest)</option>
                <option value="price">💰 Price (Lowest)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearch('')
                  setSortBy('date')
                  setPage(1)
                }}
                className="w-full border border-[#6b4f45] text-[#5E372E] py-2 rounded-lg hover:bg-[#6b4f45] hover:text-white transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c79a63] mx-auto mb-4"></div>
            <p className="text-[#6b4f45]">Loading events...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* No events */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-3xl mb-2">📭</p>
            <h3 className="text-xl font-medium text-[#5E372E] mb-2">No events found</h3>
            <p className="text-[#6b4f45]">
              {search ? 'Try adjusting your search criteria' : 'Check back soon for upcoming events!'}
            </p>
          </div>
        )}

        {/* Events grid */}
        {!loading && events.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <Card key={event._id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-[#5E372E] mb-2">{event.title}</h3>
                    <p className="text-sm text-[#6b4f45] line-clamp-2 mb-3">{event.description}</p>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#6b4f45] opacity-75">📅 Starts:</span>
                        <span className="font-medium text-[#5E372E]">{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b4f45] opacity-75">💰 Price/Person:</span>
                        <span className="font-medium text-[#c79a63]">{formatPrice(event.perPersonPrice)}</span>
                      </div>
                      {event.venue && (
                        <div className="flex justify-between">
                          <span className="text-[#6b4f45] opacity-75">📍 Venue:</span>
                          <span className="font-medium text-[#5E372E] truncate">{event.venue}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedEvent(event)
                          setShowBooking(true)
                        }}
                        className="flex-1 bg-[#c79a63] text-white py-2 rounded font-medium hover:brightness-90 transition text-sm"
                      >
                        Request Booking
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to detail view by changing the URL
                          window.location.href = `/events/${event._id}`
                        }}
                        className="flex-1 border border-[#d4ac6f] text-[#5E372E] py-2 rounded font-medium hover:bg-[#d4ac6f] hover:text-white transition text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mb-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-[#d4ac6f] text-[#5E372E] rounded-lg disabled:opacity-50 hover:bg-[#d4ac6f] hover:text-white transition"
                >
                  ← Previous
                </button>
                <span className="text-[#6b4f45]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-[#d4ac6f] text-[#5E372E] rounded-lg disabled:opacity-50 hover:bg-[#d4ac6f] hover:text-white transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-2xl font-display text-[#5E372E] mb-4">Request Booking</h2>
            <p className="text-[#6b4f45] mb-4 font-medium">{selectedEvent.title}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5E372E] mb-1">Your Name</label>
                <input
                  type="text"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  className="w-full border border-[#d4ac6f] rounded-lg px-3 py-2"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5E372E] mb-1">Email Address</label>
                <input
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  className="w-full border border-[#d4ac6f] rounded-lg px-3 py-2"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5E372E] mb-1">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  title="Number of Guests"
                  placeholder="1"
                  value={bookingData.guests}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, guests: Math.max(1, parseInt(e.target.value)) })
                  }
                  className="w-full border border-[#d4ac6f] rounded-lg px-3 py-2"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  💳 <strong>Payment:</strong> Cash on Delivery available at the event venue.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={submitBooking}
                className="flex-1 bg-[#5E372E] text-white py-2 rounded-lg font-medium hover:brightness-90 transition"
              >
                Submit Booking
              </button>
              <button
                onClick={() => {
                  setShowBooking(false)
                  setSelectedEvent(null)
                  setBookingData({ name: '', email: '', guests: 1 })
                }}
                className="flex-1 border border-[#d4ac6f] text-[#5E372E] py-2 rounded-lg font-medium hover:bg-[#d4ac6f] hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default EventsPublicPage

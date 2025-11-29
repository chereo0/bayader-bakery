import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

interface EventItem {
  _id: string
  title: string
  name?: string
  description?: string
  date?: string
  startDate?: string
  endDate?: string
  time?: string
  venue?: string
  price?: string
  perPersonPrice?: number | null
  image?: string
  theme?: string[]
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicEvents()
  }, [])

  const fetchPublicEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/events/public?limit=3`)
      if (response.data.success) {
        setEvents(response.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching public events:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatPrice = (price?: number | null) => {
    if (!price) return 'Contact us for pricing'
    return `From $${price.toFixed(2)} per person`
  }

  if (loading) return null
  if (!events.length) return null

  return (
    <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-display text-[#5E372E]">
          🎉 Upcoming Events & Offers
        </h2>
        <Link to="/events" className="text-[#c79a63] hover:text-[#b88a52] font-medium text-sm">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((e) => (
          <Link key={e._id} to={`/events/${e._id}`} className="block group">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-[#c79a63] h-full flex flex-col">
              {/* Image */}
              {e.image && (
                <div className="h-40 bg-gradient-to-br from-[#5E372E] to-[#3d241d] overflow-hidden">
                  <img
                    src={e.image}
                    alt={e.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-[#5E372E] group-hover:text-[#c79a63] transition-colors mb-2">
                  {e.title}
                </h3>

                {e.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {e.description}
                  </p>
                )}

                {/* Event Details */}
                <div className="space-y-1 text-xs text-gray-700 mb-3">
                  {e.startDate && (
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{formatDate(e.startDate)}</span>
                      {e.endDate && e.startDate !== e.endDate && (
                        <span>- {formatDate(e.endDate)}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 font-semibold text-[#c79a63]">
                    <span>💰</span>
                    <span>{formatPrice(e.perPersonPrice)}</span>
                  </div>
                </div>

                <button className="mt-auto w-full px-3 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b88a52] transition-colors text-xs font-medium">
                  View Details
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default EventsList

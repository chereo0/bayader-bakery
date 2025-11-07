import React, { useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { loadEvents } from '../admin/events/storage'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'

const EventsPublicPage: React.FC = ()=>{
  const { id } = useParams<{ id?:string }>()
  const events = loadEvents()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({ name: '', email: '', guests: 1 })

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.theme?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price?.replace(/\D/g, '') || '0')
        const priceB = parseInt(b.price?.replace(/\D/g, '') || '0')
        return priceA - priceB
      })
    }

    return filtered
  }, [events, searchTerm, sortBy])

  const handleBooking = () => {
    if (!bookingData.name || !bookingData.email || bookingData.guests < 1) {
      alert('Please fill all fields correctly')
      return
    }
    alert(`Thank you ${bookingData.name}! Your booking for ${bookingData.guests} guest(s) has been received. We'll contact you soon at ${bookingData.email}`)
    setBookingData({ name: '', email: '', guests: 1 })
    setShowBookingModal(false)
  }

  const handleShare = (eventTitle: string) => {
    const shareText = `Check out this event: ${eventTitle} at EL-Bayader Bakery!`
    if (navigator.share) {
      navigator.share({ title: 'EL-Bayader Event', text: shareText })
    } else {
      alert(`Share: ${shareText}`)
    }
  }

  if (id) {
    const e = events.find(ev=>String(ev.id)===id)
    if (!e) return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display text-bakery-900 mb-4">Event not found</h2>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      </div>
    )

    return (
      <div className="min-h-screen bg-[url('/images/polka.png')] bg-repeat py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => navigate('/events')}
            className="mb-6 text-bakery-700 hover:text-bakery-900 font-medium"
          >
            ← Back to Events
          </button>
          
          <Card className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-display text-bakery-900 mb-2">{e.title}</h1>
                <div className="text-sm text-bakery-700 mb-4">{e.name}</div>
              </div>
              <button 
                onClick={() => handleShare(e.title)}
                className="px-3 py-2 text-sm bg-bakery-100 text-bakery-900 rounded-md hover:bg-bakery-200 transition"
              >
                Share
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-bakery-900 mb-2">Event Details</h3>
                <div className="space-y-2 text-sm text-bakery-800">
                  <div><span className="font-medium">Date:</span> {new Date(e.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div><span className="font-medium">Time:</span> {e.time || 'TBD'}</div>
                  <div><span className="font-medium">Venue:</span> {e.venue || 'EL-Bayader Studio'}</div>
                  <div><span className="font-medium">Price:</span> <span className="text-lg font-semibold text-bakery-900">{e.price}</span></div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-bakery-900 mb-2">Services Included</h3>
                <div className="flex flex-wrap gap-2">
                  {e.theme?.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-bakery-200 text-bakery-900 text-xs rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setShowBookingModal(true)} className="flex-1">
                Book Now
              </Button>
              <Button variant="ghost" onClick={() => navigate('/events')}>
                View Other Events
              </Button>
            </div>
          </Card>

          {showBookingModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="p-6 max-w-md w-full">
                <h2 className="text-xl font-display text-bakery-900 mb-4">Book This Event</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-bakery-900 mb-1">Name</label>
                    <Input 
                      placeholder="Your name"
                      value={bookingData.name}
                      onChange={(e) => setBookingData({...bookingData, name: (e.target as HTMLInputElement).value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bakery-900 mb-1">Email</label>
                    <Input 
                      type="email"
                      placeholder="Your email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: (e.target as HTMLInputElement).value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bakery-900 mb-1">Number of Guests</label>
                    <Input 
                      type="number"
                      min="1"
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({...bookingData, guests: parseInt((e.target as HTMLInputElement).value) || 1})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleBooking} className="flex-1">
                      Confirm Booking
                    </Button>
                    <Button variant="ghost" onClick={() => setShowBookingModal(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Events List View
  if (!events.length) return (
    <div className="min-h-screen bg-[url('/images/polka.png')] bg-repeat flex items-center justify-center py-12">
      <Card className="p-8 text-center max-w-md">
        <h2 className="text-2xl font-display text-bakery-900 mb-2">No Events Available</h2>
        <p className="text-bakery-700 mb-4">Check back soon for upcoming events!</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-[url('/images/polka.png')] bg-repeat py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-display text-bakery-900 mb-6">Events & Plans</h1>
          
          <div className="bg-white rounded-lg p-4 shadow-soft mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-bakery-900 mb-2">Search Events</label>
                <Input 
                  placeholder="Search by title, organizer, or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bakery-900 mb-2">Sort By</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'price')}
                  className="w-full px-3 py-2 border border-bakery-200 rounded-md focus:outline-none focus:ring-2 focus:ring-bakery-700"
                >
                  <option value="date">Date (Earliest)</option>
                  <option value="price">Price (Lowest)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="text-sm text-bakery-700 mb-4">
            Showing {filteredAndSortedEvents.length} event{filteredAndSortedEvents.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>

        {filteredAndSortedEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-bakery-700">No events match your search. Try different keywords.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedEvents.map(e => (
              <div key={e.id} className="group">
                <Card className="p-4 h-full hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                  <Link to={`/events/${e.id}`} className="block">
                    <h3 className="text-lg font-semibold text-bakery-900 mb-2 group-hover:text-bakery-700 transition">{e.title}</h3>
                    <div className="text-sm text-bakery-700 mb-1">{e.name}</div>
                    <div className="text-sm text-bakery-600 mb-3">
                      📅 {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </Link>
                  
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {e.theme?.slice(0, 2).map((t, i) => (
                        <span key={i} className="px-2 py-1 bg-bakery-100 text-bakery-800 text-xs rounded">
                          {t}
                        </span>
                      ))}
                      {e.theme && e.theme.length > 2 && (
                        <span className="px-2 py-1 bg-bakery-100 text-bakery-800 text-xs rounded">
                          +{e.theme.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-bakery-900">{e.price}</div>
                    <button 
                      onClick={(event) => {
                        event.preventDefault()
                        handleShare(e.title)
                      }}
                      className="p-2 text-bakery-700 hover:bg-bakery-100 rounded transition"
                      title="Share event"
                    >
                      ↗️
                    </button>
                  </div>

                  <Link to={`/events/${e.id}`} className="block mt-3">
                    <Button variant="ghost" className="w-full text-sm">
                      View Details →
                    </Button>
                  </Link>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPublicPage

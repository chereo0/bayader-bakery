import React, { useState, useEffect, useMemo } from 'react'
import { EventItem } from './data'
import { loadEvents, saveEvents } from './storage'
import EventFormModal from './EventFormModal'

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EventItem | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loaded = loadEvents()
    setEvents(loaded)
  }, [])

  const filtered = useMemo(() => {
    if (!search) return events
    const q = search.toLowerCase()
    return events.filter(e => 
      e.title.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.venue?.toLowerCase().includes(q) ||
      e.date.includes(q)
    )
  }, [events, search])

  const handleSave = (event: EventItem) => {
    if (editing) {
      setEvents(prev => {
        const updated = prev.map(e => e.id === event.id ? event : e)
        saveEvents(updated)
        return updated
      })
    } else {
      setEvents(prev => {
        const updated = [...prev, event]
        saveEvents(updated)
        return updated
      })
    }
    setModalOpen(false)
    setEditing(null)
  }

  const handleEdit = (event: EventItem) => {
    setEditing(event)
    setModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    setEvents(prev => {
      const updated = prev.filter(e => e.id !== id)
      saveEvents(updated)
      return updated
    })
  }

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#F9F6F2] py-8" style={{ backgroundImage: "url('/images/polka.png')", backgroundRepeat: 'repeat' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display text-[#5E372E]">Events Management</h2>
          <button 
            onClick={openAdd}
            className="bg-[#d4ac6f] text-white px-4 py-2 rounded shadow hover:brightness-95 transition"
          >
            + Add New Event
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow-sm mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events by title, name, venue, or date..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b">
                  <th className="py-2">Title</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Time</th>
                  <th className="py-2">Venue</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No events found. Create your first event to get started.
                    </td>
                  </tr>
                ) : (
                  filtered.map((event, idx) => (
                    <tr key={event.id} className={`border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}>
                      <td className="py-3 font-medium">{event.title}</td>
                      <td className="py-3 text-sm text-[#6b4f45]">{event.name}</td>
                      <td className="py-3">{event.date}</td>
                      <td className="py-3">{event.time || '-'}</td>
                      <td className="py-3">{event.venue || '-'}</td>
                      <td className="py-3">{event.price || '-'}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEdit(event)}
                            className="px-3 py-1 bg-[#6b3f2f] text-white rounded text-sm hover:brightness-95"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(event.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:brightness-95"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {filtered.length} of {events.length} events
          </div>
        </div>

        <EventFormModal
          open={modalOpen}
          event={editing}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
        />
      </div>
    </div>
  )
}

export default EventsPage

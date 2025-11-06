import React, { useState, useEffect, useMemo } from 'react'
import { EventItem } from './data'
import { loadEvents, saveEvents } from './storage'
import EventFormModal from './EventFormModal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EventItem | null>(null)
  const [search, setSearch] = useState('')
  const { token } = useAuth()
  const { show } = useToast()

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    const load = async () => {
      // try backend first
      try {
        const res = await fetch(`${API_URL}/events`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
        if (res.ok) {
          const j = await res.json()
          if (j && j.success && Array.isArray(j.data)) {
            const mapped = j.data.map((e:any) => ({
              id: e._id || Date.now(),
              title: e.title,
              name: e.name,
              date: e.date,
              time: e.time,
              venue: e.venue,
              price: e.price,
              theme: e.theme || []
            }))
            setEvents(mapped)
            return
          }
        }
      } catch (err) {
        // ignore and fallback to local
        console.debug('Events load from backend failed, falling back to local', err)
      }

      const loaded = loadEvents()
      setEvents(loaded)
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

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
    const persist = async () => {
      try {
        if (editing) {
          const res = await fetch(`${API_URL}/events/${editing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(event)
          })
          if (!res.ok) throw new Error('Failed to update')
          // update local UI
          setEvents(prev => prev.map(e => e.id === event.id ? event : e))
          show && show('Event updated')
        } else {
          const res = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(event)
          })
          if (!res.ok) throw new Error('Failed to create')
          const j = await res.json().catch(()=>null)
          const created = j && j.data ? j.data : null
          const newEvent = { ...event, id: created?._id || event.id }
          setEvents(prev => [...prev, newEvent])
          show && show('Event created')
        }
      } catch (err) {
        console.error('Persist event failed, falling back to local', err)
        // fallback to local storage behavior
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
        show && show('Saved locally (offline)')
      } finally {
        setModalOpen(false)
        setEditing(null)
      }
    }

    persist()
  }

  const handleEdit = (event: EventItem) => {
    setEditing(event)
    setModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    const perform = async () => {
      try {
  const res = await fetch(`${API_URL}/events/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
        if (!res.ok) throw new Error('Delete failed')
        setEvents(prev => prev.filter(e => e.id !== id))
        show && show('Event deleted')
      } catch (err) {
        console.error('Delete failed, falling back to local', err)
        setEvents(prev => {
          const updated = prev.filter(e => e.id !== id)
          saveEvents(updated)
          return updated
        })
        show && show('Deleted locally')
      }
    }

    perform()
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

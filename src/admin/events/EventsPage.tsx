import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import sampleEvent, { EventItem } from './data'
import { loadEvents, saveEvents } from './storage'
import EventFormModal from './EventFormModal'

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([])
  const [open, setOpen] = useState(false)

  useEffect(()=>{
    const loaded = loadEvents()
    if (loaded.length) setEvents(loaded)
    else {
      // If there are no events saved yet, persist the sample event so the
      // public homepage (`EventsList`) can load and display it as well.
      setEvents([sampleEvent])
      saveEvents([sampleEvent])
    }
  }, [])

  const handleSave = (e: EventItem) => {
    const updated = events.some(x=>x.id===e.id) ? events.map(x=> x.id===e.id ? e : x) : [e, ...events]
    setEvents(updated)
    saveEvents(updated)
    setOpen(false)
  }

  return (
    <div className="min-h-screen bg-[url('/images/polka.png')] bg-repeat py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-display text-[#5E372E]">Events</h1>
          <div className="flex items-center gap-3">
            <Button variant="primary" className="bg-[#d4ac6f]" onClick={()=>setOpen(true)}>+ Add New Event</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {events.map((e, idx) => (
            <Card className="p-6" key={e.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-medium text-[#5E372E]">{e.title}</h2>
                  <div className="text-sm text-[#6b4f45]">{e.name} • {e.date} • {e.time}</div>
                </div>
                <div className="text-sm">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded">{e.status}</span>
                  <Button className="ml-3" onClick={()=>{}}>Edit</Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-[#5E372E]">Event Overview</h3>
                  <table className="w-full text-sm text-[#6b4f45] mt-2">
                    <tbody>
                      <tr><td className="py-1 font-medium">Venue:</td><td className="py-1">{e.venue}</td></tr>
                      <tr><td className="py-1 font-medium">Price:</td><td className="py-1">{e.price}</td></tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#5E372E]">Services</h3>
                  <ul className="text-sm text-[#6b4f45] mt-2 list-disc pl-5">
                    {e.theme.map((t,i)=>(<li key={i}>{t}</li>))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <EventFormModal open={open} onSave={handleSave} onClose={()=>setOpen(false)} />
      </div>
    </div>
  )
}

export default EventsPage

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EventItem } from '../admin/events/data'
import sampleEvent from '../admin/events/data'
import { loadEvents } from '../admin/events/storage'
import Card from './ui/Card'

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([])
  useEffect(()=>{
    const loaded = loadEvents()
    // If there are no events in storage yet, show the sample event so the
    // homepage isn't empty. Admin UI can create real events which will
    // replace this fallback in localStorage.
    setEvents(loaded.length ? loaded : [sampleEvent])
  }, [])

  if (!events.length) return null

  return (
    <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-display text-[#5E372E] mb-6">Events & Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(e => (
          <Link key={e.id} to={`/events/${e.id}`} className="block">
            <Card className="p-4 hover:shadow-lg transition-shadow duration-150 cursor-pointer">
              <h3 className="text-lg font-medium text-[#5E372E]">{e.title}</h3>
              <div className="text-sm text-[#6b4f45]">{e.name} • {e.date}</div>
              <div className="mt-1 text-sm font-semibold text-[#6b4f45]">Price: {e.price}</div>
              <div className="mt-2 text-sm text-[#6b4f45]">{e.theme?.slice(0,2).join(', ')}</div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default EventsList

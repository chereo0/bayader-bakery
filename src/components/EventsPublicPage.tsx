import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadEvents } from '../admin/events/storage'
import Card from './ui/Card'

const EventsPublicPage: React.FC = ()=>{
  const { id } = useParams<{ id?:string }>()
  const events = loadEvents()
  if (id) {
    const e = events.find(ev=>String(ev.id)===id)
    if (!e) return <div className="min-h-screen flex items-center justify-center">Event not found</div>
    return (
      <div className="min-h-screen bg-[url('/images/polka.png')] bg-repeat py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-6">
            <h1 className="text-2xl font-display text-[#5E372E]">{e.title}</h1>
            <div className="text-sm text-[#6b4f45] mt-2">{e.name} • {e.date} • {e.time}</div>
            <div className="mt-4 text-sm text-[#6b4f45]">Venue: {e.venue}</div>
            <div className="mt-2 text-sm font-semibold text-[#6b4f45]">Price: {e.price}</div>
            <div className="mt-4">
              <h3 className="font-medium text-[#5E372E]">Services</h3>
              <ul className="list-disc pl-5 text-sm text-[#6b4f45]">{e.theme.map((t,i)=>(<li key={i}>{t}</li>))}</ul>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // No id -> render a public listing of all events
  if (!events.length) return <div className="min-h-screen flex items-center justify-center">No events found</div>

  return (
    <div className="min-h-screen bg-[url('/images/polka.png')] bg-repeat py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-display text-[#5E372E] mb-6">Events & Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(e => (
            <Link key={e.id} to={`/events/${e.id}`} className="block">
              <Card className="p-4 hover:shadow-lg transition-shadow duration-150 cursor-pointer">
                <h3 className="text-xl font-medium text-[#5E372E]">{e.title}</h3>
                <div className="text-sm text-[#6b4f45]">{e.name} • {e.date} • {e.time}</div>
                <div className="mt-2 text-sm font-semibold text-[#6b4f45]">Price: {e.price}</div>
                <div className="mt-3 text-sm text-[#6b4f45]">{e.theme?.slice(0,3).join(', ')}</div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EventsPublicPage

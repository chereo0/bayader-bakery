import React, { useEffect, useState } from 'react'
import { EventItem } from './data'
import Button from '../../components/ui/Button'

interface Props {
  open: boolean
  event?: EventItem | null
  onSave: (e: EventItem) => void
  onClose: () => void
}

type Service = { id: number; name: string; price: number }

const EventFormModal: React.FC<Props> = ({ open, event, onSave, onClose }) => {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Wedding')
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [price, setPrice] = useState('')
  const [services, setServices] = useState<Service[]>([])

  useEffect(()=>{
    if (event) {
      setTitle(event.title)
      setType(event.title.includes('Wedding') ? 'Wedding' : 'Other')
      setName(event.name)
      setDate(event.date)
      setTime(event.time)
      setVenue(event.venue)
      setPrice(event.price)
      setServices(event.theme?.map((t,i)=>({ id:i+1, name: t, price: 0 })) || [])
    } else {
      setTitle('')
      setType('Wedding')
      setName('')
      setDate('')
      setTime('')
      setVenue('')
      setPrice('')
      setServices([])
    }
  }, [event, open])

  if (!open) return null

  const addService = () => setServices(s=>[...s, { id: Date.now(), name: '', price: 0 }])
  const updateService = (id:number, key: 'name'|'price', value: any) => setServices(s=>s.map(x=> x.id===id ? { ...x, [key]: key==='price' ? Number(value) : value } : x))
  const removeService = (id:number) => setServices(s=>s.filter(x=>x.id!==id))

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e: EventItem = {
      id: event?.id ?? Date.now(),
      title: title || `${type} - ${name}`,
      status: 'Active',
      name,
      date,
      time,
      venue,
      price,
      staffing: [],
      budgetNotes: [],
      activities: [],
      theme: services.map(s=>`${s.name} - $${s.price.toFixed(2)}`)
    }
    onSave(e)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <h3 className="text-lg font-medium text-[#5E372E] mb-4">Add / Edit Event</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs">Event Type</label>
            <select value={type} onChange={e=>setType(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option>Wedding</option>
              <option>Birthday</option>
              <option>Party</option>
            </select>
          </div>
          <div>
            <label className="text-xs">Event Name</label>
            <input required value={name} onChange={e=>setName(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="text-xs">Date</label>
            <input value={date} onChange={e=>setDate(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-xs">Time</label>
            <input value={time} onChange={e=>setTime(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs">Venue</label>
            <input value={venue} onChange={e=>setVenue(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="text-xs">Base Price</label>
            <input value={price} onChange={e=>setPrice(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs">Services (name & price)</label>
              <button type="button" onClick={addService} className="text-sm text-[#6b3f2f]">+ Add Service</button>
            </div>
            <div className="space-y-2">
              {services.map(s=> (
                <div key={s.id} className="flex gap-2">
                  <input placeholder="Service name" value={s.name} onChange={e=>updateService(s.id,'name',e.target.value)} className="flex-1 border px-3 py-2 rounded" />
                  <input placeholder="Price" value={s.price} onChange={e=>updateService(s.id,'price',e.target.value)} className="w-28 border px-3 py-2 rounded" />
                  <button type="button" onClick={()=>removeService(s.id)} className="px-3 rounded bg-red-600 text-white">x</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <Button type="submit" className="px-4 py-2">Save Event</Button>
        </div>
      </form>
    </div>
  )
}

export default EventFormModal

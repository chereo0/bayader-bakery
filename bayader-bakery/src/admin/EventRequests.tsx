import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const EventRequests: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const { token } = useAuth()
  const [requests, setRequests] = useState<any[]>([])

  useEffect(()=>{
    const load = async ()=>{
      try{
        console.debug('EventRequests token:', token)
        if (!token) return
        const headers = { Authorization: `Bearer ${token}` }
        const res = await fetch(`${API_URL}/events?limit=5`, { headers })
        if (!res.ok) return
        const j = await res.json()
        if (j && j.success && Array.isArray(j.data)) setRequests(j.data)
      }catch(err){
        console.error('Failed to load event requests', err)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="bg-white p-4 rounded shadow-sm space-y-4">
      <h3 className="text-lg font-medium text-[#5E372E]">Event Requests</h3>
      {requests.map((r:any) => (
        <div key={r._id || r.title} className="flex items-center justify-between">
          <div>
            <div className="font-medium">{r.title}</div>
            <div className="text-sm text-[#6b4f45]">{r.name || r.venue || ''}</div>
          </div>
          <button className="bg-[#6b3f2f] text-white px-3 py-1 rounded">Manage</button>
        </div>
      ))}
    </div>
  )
}

export default EventRequests

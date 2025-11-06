import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Feedbacks: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const { token } = useAuth()
  const [list, setList] = useState<any[]>([])

  useEffect(()=>{
    const load = async ()=>{
      try{
        console.debug('Feedbacks token:', token)
        if (!token) return
        const headers = { Authorization: `Bearer ${token}` }
        const res = await fetch(`${API_URL}/admin/analytics/feedbacks`, { headers })
        if (!res.ok) {
          if (res.status === 404) console.warn('Feedbacks endpoint not found (404)')
          else console.warn('Feedbacks fetch failed', res.status, res.statusText)
          return
        }
        const j = await res.json()
        if (j && j.success && Array.isArray(j.data)) setList(j.data)
      }catch(err){
        console.error('Failed to load feedbacks', err)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-medium text-[#5E372E]">Customer Feedback</h3>
      <div className="space-y-3 mt-3">
        {list.map((f:any, idx:number) => (
          <div key={idx} className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium">{f.user ?? f.productName ?? 'Customer'}</div>
              <div className="text-sm text-[#6b4f45]">{f.comment}</div>
            </div>
            <div className="text-right">
              <div className="text-yellow-500">{'★'.repeat(f.rating || 0)}</div>
              <button className="mt-2 bg-[#6b3f2f] text-white px-3 py-1 rounded text-sm">Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Feedbacks

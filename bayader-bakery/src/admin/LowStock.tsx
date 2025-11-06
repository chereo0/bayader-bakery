import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const LowStock: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const { token } = useAuth()
  const [items, setItems] = useState<any[]>([])

  useEffect(()=>{
    const load = async ()=>{
      try{
        console.debug('LowStock token:', token)
        if (!token) return
        const headers = { Authorization: `Bearer ${token}` }
        const res = await fetch(`${API_URL}/inventory/low-stock?threshold=10`, { headers })
        if (!res.ok) return
        const j = await res.json()
        if (j && j.success && j.data && Array.isArray(j.data.products)) {
          setItems(j.data.products.slice(0,5))
        }
      }catch(err){
        console.error('LowStock load failed', err)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-medium text-[#5E372E] mb-2">Low Stock Alerts</h3>
      <ul className="space-y-2 text-sm text-[#6b4f45]">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between">
            <div>{it.name}</div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">{it.stock ?? 0} pcs</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LowStock

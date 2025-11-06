import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

// Small SVG line chart used on dashboard; will request sales-by-day from admin analytics and map into points
function buildPath(points: number[], width: number, height: number, padding = 12) {
  if (points.length === 0) return ''
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const stepX = (width - padding * 2) / (points.length - 1)
  return points.map((p, i) => {
    const x = padding + i * stepX
    const y = padding + (1 - (p - min) / range) * (height - padding * 2)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}

const SalesChart: React.FC = () => {
  const width = 700
  const height = 220
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const [data, setData] = useState<{ name: string; sales: number }[]>([])
  const { token } = useAuth()

  useEffect(()=>{
    const load = async () => {
      if (!token) return
      try{
        console.debug('SalesChart token:', token)
        const headers = { Authorization: `Bearer ${token}` }
        const res = await fetch(`${API_URL}/admin/analytics/sales-by-day?days=7`, { headers })
        if (!res.ok) {
          console.warn('SalesChart fetch failed', res.status, res.statusText)
          return
        }
        const j = await res.json()
        if (j && j.success && Array.isArray(j.data)) {
          const mapped = j.data.map((d:any) => ({ name: (d._id || '').slice(-2), sales: d.totalSales || 0 }))
          setData(mapped)
        }
      }catch(err){
        console.error('SalesChart load failed', err)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const points = data.map(d => d.sales)
  const path = buildPath(points, width, height)

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-medium text-[#5E372E] mb-2">Sales Performance</h3>
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f6e9e3" />
              <stop offset="100%" stopColor="#fff" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#g1)" />
          <path d={path} fill="none" stroke="#6b3f2f" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {data.map((d, i) => {
            const x = 12 + i * ((width - 24) / (data.length - 1 || 1))
            const max = Math.max(...points, 1)
            const min = Math.min(...points, 0)
            const y = 12 + (1 - (d.sales - min) / (max - min || 1)) * (height - 24)
            return <circle key={i} cx={x} cy={y} r={3.5} fill="#6b3f2f" />
          })}
        </svg>
      </div>
    </div>
  )
}

export default SalesChart

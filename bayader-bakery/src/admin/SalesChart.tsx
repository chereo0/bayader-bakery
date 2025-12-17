import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'

const SalesChart: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const [data, setData] = useState<{ day: string; sales: number }[]>([])
  const { token } = useAuth()

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const res = await fetch(`${API_URL}/admin/analytics/sales-by-day?days=7`, { headers })

        if (res.ok) {
          const j = await res.json()
          if (j.success && Array.isArray(j.data)) {
            // Map data: ensure day name is displayed nicely
            const mapped = j.data.map((d: any) => {
              // d._id is YYYY-MM-DD
              const date = new Date(d._id)
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }) // Mon, Tue
              return { day: dayName, sales: d.totalSales || 0 }
            })
            // Recharts prefers data sorted, assume backend sends sorted or sort here
            // Often analytics returns sorted by date, if not:
            // mapped.sort((a,b) => ... ) 
            setData(mapped)
          }
        }
      } catch (err) {
        console.error('SalesChart load failed', err)
      }
    }
    load()
  }, [token])

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#f3e7d9]">
      <h3 className="text-xl font-semibold text-[#5E372E] mb-6">Sales Performance</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5E372E" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#5E372E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #f3e7d9',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => [`$${value}`, 'Sales']}
              cursor={{ stroke: '#5E372E', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#5E372E"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#5E372E' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SalesChart

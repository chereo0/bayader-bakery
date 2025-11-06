import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const StatCard: React.FC<{ title: string; value: string; small?: string }> = ({ title, value, small }) => (
  <div className="bg-white p-4 rounded shadow-sm">
    <div className="text-sm text-[#6b4f45]">{title}</div>
    <div className="text-2xl font-bold text-[#5E372E]">{value}</div>
    {small && <div className="text-xs text-gray-500">{small}</div>}
  </div>
)

const DashboardStats: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const { token } = useAuth()
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) return
        const headers = { Authorization: `Bearer ${token}` }
        const res = await fetch(`${API_URL}/admin/analytics/summary?days=30`, { headers })
        if (!res.ok) return
        const j = await res.json()
        if (j.success) setSummary(j.data)
      } catch (err) {
        console.error('Failed to load dashboard stats', err)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard title="Total Sales" value={summary ? `$${Number(summary.totalSales || 0).toFixed(2)}` : '$0.00'} small={summary ? `${summary.rangeDays}d` : ''} />
      <StatCard title="New Orders" value={summary ? String(summary.ordersCount || 0) : '0'} />
      <StatCard title="Pending Deliveries" value={summary ? `$${Number(summary.pendingDeliveryAmount || 0).toFixed(2)}` : '$0.00'} small={summary ? `${String(summary.pendingDeliveryCount || 0)} orders` : ''} />
    </div>
  )
}

export default DashboardStats

import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell
} from 'recharts'

// placeholder initial state; will be replaced by backend data
const initialSalesData: { day: string; sales: number }[] = []

const initialTopProducts: { name: string; value: number }[] = []

const channels = [
  { name: 'Website', website: 12, social: 8 },
  { name: 'Social', website: 6, social: 15 },
  { name: 'Referral', website: 10, social: 20 }
]

const orderStatus = [
  { name: 'Completed', value: 60 },
  { name: 'Pending', value: 25 },
  { name: 'Cancelled', value: 15 }
]

const COLORS = ['#6b3f2f', '#d4ac6f', '#f3e7d9']

const AnalyticsDashboard: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const [range, setRange] = useState<'30' | '7' | '90'>('30')
  const [summary, setSummary] = useState<any>(null)
  const [salesData, setSalesData] = useState(initialSalesData)
  const [topProducts, setTopProducts] = useState(initialTopProducts)
  const [loading, setLoading] = useState(false)

  const { token: bearer } = useAuth()

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const days = range
  console.debug('AnalyticsDashboard token:', bearer)
  if (!bearer) return
  const headers = { Authorization: `Bearer ${bearer}` }

        // fetch summary
        const sRes = await fetch(`${API_URL}/admin/analytics/summary?days=${days}`, { headers })
        if (sRes.ok) {
          const sJson = await sRes.json()
          if (sJson.success) setSummary(sJson.data)
        }

        // top products
        const tpRes = await fetch(`${API_URL}/admin/analytics/top-products?limit=5&days=${days}`, { headers })
        if (tpRes.ok) {
          const tpJson = await tpRes.json()
          if (tpJson.success && Array.isArray(tpJson.data)) {
            setTopProducts(tpJson.data.map((p: any) => ({ name: p.name || String(p.productId || 'Unknown'), value: p.qtySold || 0 })))
          } else {
            setTopProducts([])
          }
        }

        // sales by day
        const sdRes = await fetch(`${API_URL}/admin/analytics/sales-by-day?days=${days}`, { headers })
        if (sdRes.ok) {
          const sdJson = await sdRes.json()
          if (sdJson.success && Array.isArray(sdJson.data)) {
            setSalesData(sdJson.data.map((d: any) => ({ day: (d._id || '').slice(-2), sales: d.totalSales || 0 })))
          } else {
            setSalesData([])
          }
        }
      } catch (err) {
        console.error('Failed to load analytics', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [range, bearer])

  const handleRangeChange = (value: string) => {
    if (value === 'Last 7 days') setRange('7')
    else if (value === 'Last 90 days') setRange('90')
    else setRange('30')
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundImage: "url('/images/polka.png')", backgroundRepeat: 'repeat' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-display text-[#5E372E]">Performance Dashboard</h1>
          <select value={range} onChange={(e) => setRange(e.target.value as any)} className="border px-3 py-2 rounded">
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-sm text-[#6b4f45]">Total Revenue</div>
            <div className="text-2xl font-bold text-[#5E372E]">{summary ? `$${Number(summary.totalSales || 0).toFixed(2)}` : (loading ? 'Loading...' : '$0.00')}</div>
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-sm text-[#6b4f45]">Total Orders</div>
            <div className="text-2xl font-bold text-[#5E372E]">{summary ? (summary.ordersCount || 0) : (loading ? 'Loading...' : 0)}</div>
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-sm text-[#6b4f45]">New Customers</div>
            <div className="text-2xl font-bold text-[#5E372E]">{summary ? (summary.totalCustomers || 0) : (loading ? 'Loading...' : 0)}</div>
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-sm text-[#6b4f45]">Average Order Value</div>
            <div className="text-2xl font-bold text-[#5E372E]">{summary ? (summary.ordersCount ? `$${(Number(summary.totalSales || 0) / Number(summary.ordersCount)).toFixed(2)}` : '$0.00') : (loading ? 'Loading...' : '$0.00')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="bg-white p-4 rounded shadow-sm w-full">
            <h3 className="text-lg font-medium text-[#5E372E] mb-2">Sales Trend - Last 30 Days</h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#6b3f2f" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm w-full">
            <h3 className="text-lg font-medium text-[#5E372E] mb-2">Top 5 Best-Selling Products</h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#d4ac6f" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm w-full">
            <h3 className="text-lg font-medium text-[#5E372E] mb-2">Order Status</h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {orderStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm w-full">
            <h3 className="text-lg font-medium text-[#5E372E] mb-2">Customer Acquisition Channel</h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="website" fill="#6b3f2f" />
                  <Bar dataKey="social" fill="#d4ac6f" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard

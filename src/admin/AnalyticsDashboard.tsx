import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell
} from 'recharts'

const salesData = [
  { day: '1', sales: 5 },{ day: '5', sales: 15 },{ day: '10', sales: 30 },{ day: '15', sales: 25 },{ day: '20', sales: 40 },{ day: '25', sales: 60 },{ day: '30', sales: 90 }
]

const topProducts = [
  { name: 'Velvet Croissant', value: 25 },
  { name: 'Almond Croissant', value: 22 },
  { name: 'Almond Cake', value: 20 },
  { name: 'Macarons', value: 18 },
  { name: 'Cookies', value: 15 }
]

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
  return (
    <div className="min-h-screen py-8" style={{ backgroundImage: "url('/images/polka.png')", backgroundRepeat: 'repeat' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-display text-[#5E372E]">Performance Dashboard</h1>
          <select className="border px-3 py-2 rounded">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-sm text-[#6b4f45]">Total Revenue</div>
            <div className="text-2xl font-bold text-[#5E372E]">$5.00</div>
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-sm text-[#6b4f45]">Total Orders</div>
            <div className="text-2xl font-bold text-[#5E372E]">$55.00</div>
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-sm text-[#6b4f45]">New Customers</div>
            <div className="text-2xl font-bold text-[#5E372E]">13</div>
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-sm text-[#6b4f45]">Average Order Value</div>
            <div className="text-2xl font-bold text-[#5E372E]">$15.00</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="text-lg font-medium text-[#5E372E] mb-2">Sales Trend - Last 30 Days</h3>
            <div style={{ height: 240 }}>
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

          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="text-lg font-medium text-[#5E372E] mb-2">Top 5 Best-Selling Products</h3>
            <div style={{ height: 240 }}>
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

          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="text-lg font-medium text-[#5E372E] mb-2">Order Status</h3>
            <div style={{ height: 240 }}>
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

          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="text-lg font-medium text-[#5E372E] mb-2">Customer Acquisition Channel</h3>
            <div style={{ height: 240 }}>
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

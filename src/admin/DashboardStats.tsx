import React from 'react'

const StatCard: React.FC<{ title: string; value: string; small?: string }> = ({ title, value, small }) => (
  <div className="bg-white p-4 rounded shadow-sm">
    <div className="text-sm text-[#6b4f45]">{title}</div>
    <div className="text-2xl font-bold text-[#5E372E]">{value}</div>
    {small && <div className="text-xs text-gray-500">{small}</div>}
  </div>
)

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard title="Total Sales" value="$1,800" />
      <StatCard title="New Orders" value="45" />
      <StatCard title="Pending Deliveries" value="$12" />
    </div>
  )
}

export default DashboardStats

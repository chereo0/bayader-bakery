import React from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SummaryCardProps {
  title: string
  value: number
  trend: number[]
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, trend }) => {
  const data = trend.map((val, index) => ({ name: '', value: val }))

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-[#5E372E]">{value}</p>
        <div className="w-20 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#D97706" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default SummaryCard


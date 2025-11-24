import React from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SummaryCardProps {
  title: string
  value: number
  trend: number[]
  loading?: boolean
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, trend, loading = false }) => {
  // Filter out any NaN or invalid values and ensure we have valid data
  const validTrend = (trend || []).map(val => isNaN(val) ? 0 : val)
  const data = validTrend.map((val, index) => ({ name: '', value: val }))

  // Determine trend direction using valid trend data
  const trendUp = validTrend.length > 0 ? validTrend[validTrend.length - 1] >= validTrend[0] : true
  const trendDifference = validTrend.length > 0 ? validTrend[validTrend.length - 1] - validTrend[0] : 0
  const percentChange = validTrend.length > 1 && validTrend[0] !== 0
    ? Math.round((trendDifference / Math.abs(validTrend[0])) * 100) 
    : 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {percentChange !== 0 && (
          <span className={`text-xs font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? '↑' : '↓'} {Math.abs(percentChange)}%
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-[#5E372E]">{loading ? '...' : value}</p>
        <div className="w-20 h-12 flex-shrink-0">
          {!loading && validTrend.length > 0 && (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#D97706" 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default SummaryCard


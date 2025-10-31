import React from 'react'

interface SummaryCardProps {
  title: string
  value: number
  icon?: React.ReactNode
}

const TruckIcon = () => (
  <svg className="h-8 w-8 text-[#c79a63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6.75V16.5m-9.75-3H13.5m-3.75 3H7.5m.75-9V8.25m0 0V6a2.25 2.25 0 012.25-2.25h6a2.25 2.25 0 012.25 2.25v2.25M7.5 13.5h4.5m0 0H18v-1.5m-6 1.5v-6m-1.5 0H9m3.75 3v9m-4.5 0H12M15.75 16.5h3a2.25 2.25 0 002.25-2.25V9.75a2.25 2.25 0 00-2.25-2.25h-3M15.75 16.5V21m-9-4.5v-6m9 6v6m-9-4.5h6m-6 0H12" />
  </svg>
)

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon = <TruckIcon /> }) => {
  return (
    <div className="bg-[#fffaf4] p-6 rounded-lg shadow-sm border border-[#f3e7d9]/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#6b4f45]">{title}</h3>
        <div>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-[#5E372E]">{value}</p>
        <div className="w-20 h-12 flex items-end">
          <div className="w-full h-8 bg-gradient-to-t from-[#c79a63]/20 to-transparent rounded-t"></div>
        </div>
      </div>
    </div>
  )
}

export default SummaryCard


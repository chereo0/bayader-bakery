import React from 'react'
import { drivers } from './data'

const DriverCard: React.FC<{ driver: typeof drivers[0] }> = ({ driver }) => {
  const statusStyles = driver.status === 'available' 
    ? 'bg-green-100 text-green-800 border-green-200' 
    : 'bg-blue-100 text-blue-800 border-blue-200'

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#5E372E] rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {driver.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-[#5E372E]">{driver.name}</p>
            <p className="text-xs text-gray-500">{driver.status === 'on-route' ? `On Route ${driver.currentOrder}` : 'Available'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles}`}>
          {driver.status === 'available' ? 'Available' : 'On Route'}
        </span>
      </div>
      {driver.currentOrder && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Order {driver.currentOrder}</span>
        </div>
      )}
    </div>
  )
}

const DeliveryCoordination: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
      <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Delivery Coordination</h3>
      <div className="space-y-3">
        {drivers.map((driver) => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
      </div>
    </div>
  )
}

export default DeliveryCoordination


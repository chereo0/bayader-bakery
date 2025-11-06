import React, { useState } from 'react'
import { Delivery, deliveries as initialDeliveries } from './data'

const RoutePlannerPage: React.FC = () => {
  const [deliveries] = useState<Delivery[]>(initialDeliveries.filter(d => d.status !== 'delivered'))
  const [selectedRoute, setSelectedRoute] = useState<string>('optimized')

  const routeOptions = [
    { id: 'optimized', label: 'Optimized Route', description: 'Fastest delivery path' },
    { id: 'sequence', label: 'Sequential Order', description: 'By order number' },
    { id: 'distance', label: 'Shortest Distance', description: 'Minimize travel time' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-[#fffaf4] rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#5E372E]">Route Planner</h2>
          <button className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors font-medium">
            View Full Map
          </button>
        </div>

        {/* Route Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {routeOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedRoute(option.id)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedRoute === option.id
                  ? 'border-[#5E372E] bg-[#f9f3eb]'
                  : 'border-[#f3e7d9] bg-white hover:border-[#c79a63]'
              }`}
            >
              <div className="font-semibold text-[#5E372E] mb-1">{option.label}</div>
              <div className="text-sm text-[#6b4f45]">{option.description}</div>
            </button>
          ))}
        </div>

        {/* Delivery Route List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Delivery Route ({deliveries.length} stops)</h3>
          {deliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#f3e7d9] hover:border-[#c79a63] transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-[#5E372E] text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-[#5E372E]">{delivery.customerName}</div>
                <div className="text-sm text-[#6b4f45]">{delivery.address}</div>
                <div className="text-xs text-[#c79a63] mt-1">Order: {delivery.orderId}</div>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-[#c79a63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Summary */}
      <div className="bg-[#fffaf4] rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Route Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-[#f3e7d9]">
            <div className="text-sm text-[#6b4f45] mb-1">Total Stops</div>
            <div className="text-2xl font-bold text-[#5E372E]">{deliveries.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#f3e7d9]">
            <div className="text-sm text-[#6b4f45] mb-1">Estimated Time</div>
            <div className="text-2xl font-bold text-[#5E372E]">2h 15m</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#f3e7d9]">
            <div className="text-sm text-[#6b4f45] mb-1">Total Distance</div>
            <div className="text-2xl font-bold text-[#5E372E]">45 km</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoutePlannerPage


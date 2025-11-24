import React, { useState, useEffect } from 'react'
import { Delivery, deliveries as initialDeliveries } from './data'
import routeService, { Route } from './services/routeService'
import MapView from './components/MapView'

const RoutePlannerPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries.filter(d => d.status !== 'delivered'))
  const [selectedRoute, setSelectedRoute] = useState<string>('optimized')
  const [route, setRoute] = useState<Route | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)

  const routeOptions = [
    { id: 'optimized', label: 'Optimized Route', description: 'Fastest delivery path' },
    { id: 'sequence', label: 'Sequential Order', description: 'By order number' },
    { id: 'distance', label: 'Shortest Distance', description: 'Minimize travel time' },
  ]

  // Fetch route when selection changes
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true)
        setError(null)
        const fetchedRoute = await routeService.getRoute(selectedRoute as any)
        setRoute(fetchedRoute)
      } catch (err) {
        console.error('Error fetching route:', err)
        setError('Failed to load route. Using demo data.')
        // Fallback to demo data
        setRoute({
          stops: deliveries.map(d => ({
            _id: d.id,
            orderId: d.orderId,
            address: d.address,
            customerName: d.customerName,
            phone: d.phone,
            status: d.status,
          })),
          totalDistance: 45,
          estimatedTime: 135,
          type: selectedRoute as any,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoute()
  }, [selectedRoute])

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-[#fffaf4] rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#5E372E]">Route Planner</h2>
          <button 
            onClick={() => setMapOpen(true)}
            className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors font-medium"
          >
            View Full Map
          </button>
        </div>

        {/* Route Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {routeOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedRoute(option.id)}
              disabled={loading}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedRoute === option.id
                  ? 'border-[#5E372E] bg-[#f9f3eb]'
                  : 'border-[#f3e7d9] bg-white hover:border-[#c79a63]'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="font-semibold text-[#5E372E] mb-1">{option.label}</div>
              <div className="text-sm text-[#6b4f45]">{option.description}</div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E372E]"></div>
          </div>
        )}

        {!loading && route && (
          <>
            {/* Delivery Route List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Delivery Route ({route.stops.length} stops)</h3>
              {route.stops.map((stop, index) => (
                <div
                  key={stop._id}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#f3e7d9] hover:border-[#c79a63] transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[#5E372E] text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#5E372E]">{stop.customerName}</div>
                    <div className="text-sm text-[#6b4f45]">{stop.address}</div>
                    <div className="text-xs text-[#c79a63] mt-1">Order: {stop.orderId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#c79a63]/10 text-[#c79a63] rounded text-xs font-medium">
                      {stop.status}
                    </span>
                    <svg className="w-5 h-5 text-[#c79a63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Route Summary */}
      {route && (
        <div className="bg-[#fffaf4] rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Route Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#f3e7d9]">
              <div className="text-sm text-[#6b4f45] mb-1">Total Stops</div>
              <div className="text-2xl font-bold text-[#5E372E]">{route.stops.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#f3e7d9]">
              <div className="text-sm text-[#6b4f45] mb-1">Estimated Time</div>
              <div className="text-2xl font-bold text-[#5E372E]">{routeService.formatTime(route.estimatedTime)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#f3e7d9]">
              <div className="text-sm text-[#6b4f45] mb-1">Total Distance</div>
              <div className="text-2xl font-bold text-[#5E372E]">{routeService.formatDistance(route.totalDistance)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {mapOpen && route && (
        <MapView stops={route.stops} onClose={() => setMapOpen(false)} />
      )}
    </div>
  )
}

export default RoutePlannerPage


import React from 'react'
import { RouteStop } from '../services/routeService'

interface MapViewProps {
  stops: RouteStop[]
  onClose: () => void
}

const MapView: React.FC<MapViewProps> = ({ stops, onClose }) => {
  // Generate SVG coordinates for route visualization
  const generateRouteCoordinates = () => {
    const width = 600
    const height = 500
    const padding = 60

    // Guard against empty stops array
    if (!stops || stops.length === 0) {
      return { coords: [], width, height }
    }

    // For demo, we'll create a simple path layout
    // In production, this would use real coordinates
    const coords = stops.map((_, index) => {
      const angle = (index / stops.length) * Math.PI * 2
      const radius = Math.min(width, height) / 2 - padding
      const x = width / 2 + radius * Math.cos(angle)
      const y = height / 2 + radius * Math.sin(angle)
      
      // Ensure coordinates are valid numbers
      return { 
        x: isNaN(x) ? width / 2 : x, 
        y: isNaN(y) ? height / 2 : y 
      }
    })

    return { coords, width, height }
  }

  const { coords, width, height } = generateRouteCoordinates()

  // Generate path for route line
  const pathData = coords.length > 0
    ? coords
        .filter(coord => !isNaN(coord.x) && !isNaN(coord.y)) // Filter out invalid coordinates
        .map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`)
        .join(' ')
    : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-[#5E372E]">Route Map - {stops.length} Stops</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Map Visualization */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
            <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="bg-white rounded border border-gray-200">
              {/* Grid background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d={`M ${40} 0 L 0 0 0 ${40}`} fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width={width} height={height} fill="url(#grid)" />

              {/* Route line */}
              {pathData && (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#c79a63"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  opacity="0.7"
                />
              )}

              {/* Delivery stops */}
              {coords
                .filter(coord => !isNaN(coord.x) && !isNaN(coord.y)) // Filter out invalid coordinates
                .map((coord, index) => (
                <g key={index}>
                  {/* Circle background */}
                  <circle cx={coord.x} cy={coord.y} r="25" fill="#5E372E" opacity="0.1" />

                  {/* Stop marker */}
                  <circle cx={coord.x} cy={coord.y} r="18" fill="#5E372E" stroke="#fff" strokeWidth="2" />

                  {/* Stop number */}
                  <text
                    x={coord.x}
                    y={coord.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {index + 1}
                  </text>
                </g>
              ))}

              {/* Start point indicator */}
              {coords.length > 0 && (
                <g>
                  <circle cx={coords[0].x} cy={coords[0].y} r="28" fill="none" stroke="#7db36b" strokeWidth="3" />
                  <text
                    x={coords[0].x}
                    y={coords[0].y + 45}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#7db36b"
                    fontWeight="bold"
                  >
                    START
                  </text>
                </g>
              )}

              {/* End point indicator */}
              {coords.length > 0 && (
                <g>
                  <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="28" fill="none" stroke="#c79a63" strokeWidth="3" />
                  <text
                    x={coords[coords.length - 1].x}
                    y={coords[coords.length - 1].y - 40}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#c79a63"
                    fontWeight="bold"
                  >
                    END
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Route Details */}
          <div className="bg-[#fffaf4] rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-[#5E372E] mb-4">Delivery Order</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stops.map((stop, index) => (
                <div key={stop._id} className="flex gap-3 p-3 bg-white rounded border border-[#f3e7d9]">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#5E372E] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#5E372E] text-sm">{stop.customerName}</div>
                    <div className="text-xs text-[#6b4f45] truncate">{stop.address}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#c79a63] font-medium">Order: {stop.orderId}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        stop.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : stop.status === 'picked'
                          ? 'bg-blue-100 text-blue-800'
                          : stop.status === 'in-transit'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {stop.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-[#5E372E] mb-3">Map Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#5E372E] rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <span className="text-sm text-gray-700">Delivery Stops</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-[#c79a63]"></div>
                <span className="text-sm text-gray-700">Route Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-[#7db36b]"></div>
                <span className="text-sm text-gray-700">Start Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-[#c79a63]"></div>
                <span className="text-sm text-gray-700">End Point</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView

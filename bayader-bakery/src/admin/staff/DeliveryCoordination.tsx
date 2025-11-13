import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

interface Driver {
  _id: string
  name: string
  email: string
  phone: string
  status: 'available' | 'on-route'
  currentOrder?: {
    _id: string
    orderNumber: string
    customerName: string
    destination: string
  }
}

const DriverCard: React.FC<{ driver: Driver }> = ({ driver }) => {
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
            <p className="text-xs text-gray-500">{driver.status === 'on-route' ? `On Route - Order #${driver.currentOrder?.orderNumber}` : 'Available'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles}`}>
          {driver.status === 'available' ? 'Available' : 'On Route'}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{driver.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{driver.phone}</span>
        </div>
        {driver.currentOrder && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{driver.currentOrder.customerName} - {driver.currentOrder.destination}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const DeliveryCoordination: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        setError('No authentication token found')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/deliveries/drivers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch drivers')
      }

      const data = await response.json()
      setDrivers(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
      <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Delivery Coordination</h3>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading drivers...</div>
      ) : (
        <div className="space-y-3">
          {drivers.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No drivers available</div>
          ) : (
            drivers.map((driver: Driver) => (
              <DriverCard key={driver._id} driver={driver} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default DeliveryCoordination


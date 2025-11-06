import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

interface Delivery {
  _id: string
  orderId: string
  driverName: string
  status: string
  estimatedDate: string
  actualDate?: string
  deliveryAddress: string
  notes?: string
}

const DeliveriesManagementPage: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const { token } = useAuth()
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const deliveryStatuses = ['pending', 'assigned', 'in-transit', 'delivered', 'failed']
  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    assigned: 'bg-blue-100 text-blue-800',
    'in-transit': 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  useEffect(() => {
    const loadDeliveries = async () => {
      if (!token) return
      setLoading(true)
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`
        const res = await fetch(`${API_URL}/deliveries${query}`, { headers })
        if (res.ok) {
          const j = await res.json()
          if (j.success && j.data.deliveries) {
            setDeliveries(j.data.deliveries.map((d: any) => ({
              _id: d._id,
              orderId: d.order?._id || d._id,
              customerName: 'Customer',
              status: d.status,
              address: `${d.deliveryAddress?.city || 'N/A'}, ${d.deliveryAddress?.line1 || ''}`,
              createdAt: d.createdAt,
              driver: d.driver?.name,
              estimatedDate: d.estimatedDeliveryDate,
            })))
          }
        }
      } catch (err) {
        console.error('Failed to load deliveries', err)
      } finally {
        setLoading(false)
      }
    }
    loadDeliveries()
  }, [token, statusFilter, API_URL])

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#5E372E] mb-6">Deliveries Management</h1>

      <div className="bg-white p-4 rounded shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded transition ${
                statusFilter === 'all'
                  ? 'bg-[#6b3f2f] text-white'
                  : 'bg-[#f0e6de] text-[#5E372E] hover:bg-[#e8d9cc]'
              }`}
            >
              All Deliveries
            </button>
            {deliveryStatuses.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded transition capitalize ${
                  statusFilter === status
                    ? 'bg-[#6b3f2f] text-white'
                    : 'bg-[#f0e6de] text-[#5E372E] hover:bg-[#e8d9cc]'
                }`}
              >
                {status.replace('-', ' ')}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${deliveries.length} deliveries`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliveries.map((delivery) => (
          <div key={delivery._id} className="bg-white p-4 rounded shadow-sm border-l-4 border-[#6b3f2f]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-[#5E372E]">{delivery.customerName}</h3>
                <p className="text-xs text-gray-500 font-mono">{delivery.orderId.slice(-8)}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[delivery.status] || 'bg-gray-100'}`}>
                {delivery.status.replace('-', ' ')}
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div>
                <p className="text-gray-600 text-xs">Delivery Address</p>
                <p className="font-medium">{delivery.address}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Order Date</p>
                <p className="font-medium">{new Date(delivery.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-[#6b3f2f] text-white px-3 py-2 rounded text-xs hover:bg-[#5a2e1a] transition">
                Track
              </button>
              <button className="flex-1 bg-[#f0e6de] text-[#5E372E] px-3 py-2 rounded text-xs hover:bg-[#e8d9cc] transition">
                Update
              </button>
            </div>
          </div>
        ))}
      </div>

      {deliveries.length === 0 && (
        <div className="bg-white p-8 rounded shadow-sm text-center text-gray-500">
          No deliveries found
        </div>
      )}
    </div>
  )
}

export default DeliveriesManagementPage

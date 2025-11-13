import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api';

interface OrderItem {
  product: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  _id: string
  orderNumber?: string
  user?: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'
  deliveryAddress?: {
    line1: string
    city: string
    postalCode?: string
  }
  createdAt: string
}

interface TabProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

interface OrderStats {
  pending: number
  confirmed: number
  preparing: number
  'out-for-delivery': number
  delivered: number
  cancelled: number
}

const Tab: React.FC<TabProps> = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
      active
        ? 'bg-white text-[#5E372E] border-t-2 border-[#5E372E]'
        : 'bg-gray-100 text-gray-600 hover:bg-white'
    }`}
  >
    {label} ({count})
  </button>
)

interface OrdersTableProps {
  orders: Order[]
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'ready'
  onStatusUpdate: (orderId: string, newStatus: string) => Promise<void>
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, status, onStatusUpdate }) => {
  const [updating, setUpdating] = useState<Set<string>>(new Set())

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(prev => new Set(prev).add(orderId))
    try {
      await onStatusUpdate(orderId, newStatus)
    } finally {
      setUpdating(prev => {
        const updated = new Set(prev)
        updated.delete(orderId)
        return updated
      })
    }
  }

  const getNextStatus = (currentStatus: string): { label: string; value: string } | null => {
    const statusFlow: { [key: string]: { label: string; value: string } | null } = {
      'pending': { label: 'Start Preparing', value: 'preparing' },
      'confirmed': { label: 'Start Preparing', value: 'preparing' },
      'preparing': { label: 'Mark as Ready', value: 'out-for-delivery' },
      'out-for-delivery': null,
      'delivered': null,
      'cancelled': null
    }
    return statusFlow[currentStatus] || null
  }

  const getStatusBadgeColor = (orderStatus: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-gray-100 text-gray-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-yellow-100 text-yellow-800',
      'out-for-delivery': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[orderStatus] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.status)
              const isUpdating = updating.has(order._id)
              
              return (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#5E372E]">
                    {order._id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-medium text-gray-900">{order.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{order.user?.phone || order.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs">
                      {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {nextStatus ? (
                      <button
                        onClick={() => handleStatusChange(order._id, nextStatus.value)}
                        disabled={isUpdating}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          order.status === 'preparing'
                            ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                            : 'bg-[#5E372E] text-white hover:bg-[#6b453f] disabled:opacity-50'
                        }`}
                      >
                        {isUpdating ? (
                          <>
                            <svg className="inline w-4 h-4 mr-2 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Updating...
                          </>
                        ) : (
                          nextStatus.label
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">No action</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const CurrentCustomerOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'preparing'>('pending')
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const token = localStorage.getItem('token')

  // Fetch orders and stats
  useEffect(() => {
    fetchOrders()
    fetchStats()
    const interval = setInterval(() => {
      fetchOrders()
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [activeTab])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        setError('No authentication token found')
        setLoading(false)
        return
      }

      const statusMap: { [key: string]: string } = {
        'pending': 'pending',
        'confirmed': 'confirmed',
        'preparing': 'preparing'
      }

      const url = `${API_BASE_URL}/orders/staff/dashboard?status=${statusMap[activeTab]}&page=1&limit=50`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`)
      }

      const result = await response.json()
      setOrders(result.data || [])
      setLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders'
      setError(message)
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/orders/staff/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setStats(result.data || null)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      setSuccess('Order status updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
      fetchOrders()
      fetchStats()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating order'
      setError(message)
      setTimeout(() => setError(null), 5000)
    }
  }

  const tabs = [
    { key: 'pending', label: 'Pending', count: stats?.pending || 0 },
    { key: 'confirmed', label: 'Confirmed', count: stats?.confirmed || 0 },
    { key: 'preparing', label: 'Preparing', count: stats?.preparing || 0 }
  ]

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">✕</button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">✕</button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200 px-4 bg-gray-100 rounded-t-lg flex gap-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              label={tab.label}
              count={tab.count}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            />
          ))}
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <svg className="w-8 h-8 animate-spin mx-auto text-[#5E372E] mb-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No orders in this status</p>
            </div>
          ) : (
            <OrdersTable orders={orders} status={activeTab} onStatusUpdate={handleStatusUpdate} />
          )}
        </div>
      </div>
    </div>
  )
}

export default CurrentCustomerOrders


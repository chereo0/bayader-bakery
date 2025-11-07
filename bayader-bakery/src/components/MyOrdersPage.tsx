import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import OrderDetailsModal from './OrderDetailsModal'

interface Order {
  _id: string
  items: Array<{
    product: string
    name: string
    price: number
    quantity: number
    image?: string
  }>
  totalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'
  deliveryAddress: {
    line1: string
    line2?: string
    city: string
    postalCode?: string
    country: string
    phone: string
  }
  payment: {
    method: string
    paid: boolean
    transactionId?: string
  }
  createdAt: string
  updatedAt: string
}

export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    fetchOrders()
  }, [isAuthenticated, navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/my`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      'out-for-delivery': 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      'out-for-delivery': 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
    return labels[status] || status
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      setIsCancelling(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to cancel order')
      }

      const result = await response.json()
      
      // Update the order in the list
      setOrders(orders.map(o => o._id === orderId ? result.data : o))
      
      // Update selected order if it's the one being cancelled
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(result.data)
      }
      
      // Show success message
      alert('Order cancelled successfully! Stock has been restored.')
    } catch (err) {
      console.error('Error cancelling order:', err)
      alert(err instanceof Error ? err.message : 'Failed to cancel order')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display text-bakery-900 mb-2">My Orders</h1>
          <p className="text-bakery-700">Track and manage your bakery orders</p>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-bakery-900 text-white'
                  : 'bg-bakery-100 text-bakery-900 hover:bg-bakery-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'pending'
                  ? 'bg-bakery-900 text-white'
                  : 'bg-bakery-100 text-bakery-900 hover:bg-bakery-200'
              }`}
            >
              Pending ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'confirmed'
                  ? 'bg-bakery-900 text-white'
                  : 'bg-bakery-100 text-bakery-900 hover:bg-bakery-200'
              }`}
            >
              Confirmed ({orders.filter(o => o.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilterStatus('preparing')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'preparing'
                  ? 'bg-bakery-900 text-white'
                  : 'bg-bakery-100 text-bakery-900 hover:bg-bakery-200'
              }`}
            >
              Preparing ({orders.filter(o => o.status === 'preparing').length})
            </button>
            <button
              onClick={() => setFilterStatus('out-for-delivery')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'out-for-delivery'
                  ? 'bg-bakery-900 text-white'
                  : 'bg-bakery-100 text-bakery-900 hover:bg-bakery-200'
              }`}
            >
              Out for Delivery ({orders.filter(o => o.status === 'out-for-delivery').length})
            </button>
            <button
              onClick={() => setFilterStatus('delivered')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'delivered'
                  ? 'bg-bakery-900 text-white'
                  : 'bg-bakery-100 text-bakery-900 hover:bg-bakery-200'
              }`}
            >
              Delivered ({orders.filter(o => o.status === 'delivered').length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bakery-900"></div>
            <p className="mt-4 text-bakery-700">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error: {error}</p>
            <Button onClick={fetchOrders} className="mt-3">Retry</Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-2xl font-display text-bakery-900 mb-2">No orders found</h3>
            <p className="text-bakery-700 mb-6">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet. Start shopping!" 
                : `No ${filterStatus} orders at the moment.`}
            </p>
            <Button onClick={() => navigate('/products')}>Browse Products</Button>
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-bakery-200">
                  <div>
                    <p className="text-sm text-bakery-600">Order ID: {order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-bakery-600">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-semibold text-bakery-900 mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-bakery-700">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-bakery-200">
                  <div>
                    <p className="text-xs text-bakery-600 font-semibold">DELIVERY ADDRESS</p>
                    <p className="text-sm text-bakery-900">
                      {order.deliveryAddress.line1}
                      {order.deliveryAddress.line2 && <>, {order.deliveryAddress.line2}</>}
                    </p>
                    <p className="text-sm text-bakery-900">
                      {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
                    </p>
                    <p className="text-sm text-bakery-900">{order.deliveryAddress.country}</p>
                    <p className="text-sm text-bakery-900">📞 {order.deliveryAddress.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-bakery-600 font-semibold">PAYMENT METHOD</p>
                    <p className="text-sm text-bakery-900 capitalize">{order.payment.method}</p>
                    <p className={`text-sm font-semibold ${order.payment.paid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.payment.paid ? '✓ Paid' : '⏳ Pending'}
                    </p>
                    {order.payment.transactionId && (
                      <p className="text-xs text-bakery-600 mt-1">ID: {order.payment.transactionId}</p>
                    )}
                  </div>
                </div>

                {/* Total and Action */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="text-xl font-bold text-bakery-900 mb-3 md:mb-0">
                    Total: ${order.totalAmount.toFixed(2)}
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button 
                        variant="ghost" 
                        className="text-sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
                            handleCancelOrder(order._id)
                          }
                        }}
                      >
                        Cancel Order
                      </Button>
                    )}
                    <Button 
                      className="text-sm"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onCancel={handleCancelOrder}
          isCancelling={isCancelling}
        />
      )}
    </div>
  )
}

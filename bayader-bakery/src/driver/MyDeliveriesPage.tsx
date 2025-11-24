import React, { useState, useEffect } from 'react'
import orderService, { DriverOrder } from './services/orderService'

interface OrderDisplay {
  id: string
  orderNumber: string
  customerName: string
  address: string
  totalAmount: number
  deliveryStatus: string
  phone?: string
  estimatedDeliveryDate?: string
}

const MyDeliveriesPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'assigned' | 'in-transit' | 'delivered'>('pending')

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const data = await orderService.getMyOrders()

        // Transform backend order data to display format
        const transformed = data.map((o: DriverOrder) => ({
          id: o._id,
          orderNumber: o.orderNumber,
          customerName: o.user.name || 'Customer',
          address: orderService.formatAddress(o.deliveryAddress),
          totalAmount: o.totalAmount,
          deliveryStatus: o.deliveryStatus,
          phone: o.user.phone,
          estimatedDeliveryDate: o.estimatedDeliveryDate,
        }))

        setOrders(transformed)
        setError(null)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to load orders. Please try again.')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: 'in-transit' | 'delivered' | 'failed') => {
    try {
      await orderService.updateDeliveryStatus(orderId, newStatus)

      // Update in frontend
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId ? { ...o, deliveryStatus: newStatus } : o
        )
      )
    } catch (err) {
      console.error('Error updating delivery status:', err)
      alert('Failed to update delivery status')
    }
  }

  // Filter and count orders by delivery status
  const pendingCount = orders.filter(o => o.deliveryStatus === 'pending' || o.deliveryStatus === 'assigned').length
  const inTransitCount = orders.filter(o => o.deliveryStatus === 'in-transit').length
  const deliveredCount = orders.filter(o => o.deliveryStatus === 'delivered').length

  // Get filtered orders based on active tab
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'pending':
        return orders.filter(o => o.deliveryStatus === 'pending' || o.deliveryStatus === 'assigned')
      case 'in-transit':
        return orders.filter(o => o.deliveryStatus === 'in-transit')
      case 'delivered':
        return orders.filter(o => o.deliveryStatus === 'delivered')
      default:
        return orders
    }
  }

  const filteredOrders = getFilteredOrders()

  return (
    <div className="bg-[#fffaf4] rounded-lg shadow-sm min-h-[600px] p-6">
      <h2 className="text-2xl font-semibold text-[#5E372E] mb-6">My Orders</h2>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E372E]"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Tabs */}
          <div className="border-b border-[#f3e7d9] mb-4">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-[#fffaf4] text-[#5E372E] border-t-2 border-[#5E372E] -mb-[1px]'
                    : 'bg-transparent text-[#6b4f45] hover:text-[#5E372E]'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('in-transit')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'in-transit'
                    ? 'bg-[#fffaf4] text-[#5E372E] border-t-2 border-[#5E372E] -mb-[1px]'
                    : 'bg-transparent text-[#6b4f45] hover:text-[#5E372E]'
                }`}
              >
                In Transit ({inTransitCount})
              </button>
              <button
                onClick={() => setActiveTab('delivered')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'delivered'
                    ? 'bg-[#fffaf4] text-[#5E372E] border-t-2 border-[#5E372E] -mb-[1px]'
                    : 'bg-transparent text-[#6b4f45] hover:text-[#5E372E]'
                }`}
              >
                Delivered ({deliveredCount})
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-[#6b4f45]">
                <p className="text-lg">No orders found</p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-[#f3e7d9] p-4 hover:border-[#c79a63] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#5E372E]">{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderService.getDeliveryStatusClass(order.deliveryStatus)}`}>
                          {orderService.getDeliveryStatusLabel(order.deliveryStatus)}
                        </span>
                      </div>
                      <p className="text-sm text-[#6b4f45] mb-1">
                        <strong>Customer:</strong> {order.customerName}
                      </p>
                      <p className="text-sm text-[#6b4f45] mb-1">
                        <strong>Address:</strong> {order.address}
                      </p>
                      {order.phone && (
                        <p className="text-sm text-[#6b4f45] mb-1">
                          <strong>Phone:</strong> {order.phone}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-[#5E372E]">
                        Amount: ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {order.deliveryStatus === 'pending' || order.deliveryStatus === 'assigned' ? (
                        <button
                          onClick={() => handleStatusChange(order.id, 'in-transit')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          Start Delivery
                        </button>
                      ) : order.deliveryStatus === 'in-transit' ? (
                        <button
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          Mark Delivered
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default MyDeliveriesPage

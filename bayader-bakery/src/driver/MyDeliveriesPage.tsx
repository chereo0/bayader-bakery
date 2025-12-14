import React, { useState, useEffect } from 'react'
import orderService, { DriverOrder } from './services/orderService'
import AcceptRejectModal from './components/AcceptRejectModal'
import IssueReportModal from './components/IssueReportModal'
import toast, { Toaster } from 'react-hot-toast'
import { socketService } from '../services/socketService'

interface OrderDisplay {
  id: string
  orderNumber: string
  customerName: string
  address: string
  totalAmount: number
  deliveryStatus: string
  assignmentStatus?: string
  phone?: string
  estimatedDeliveryDate?: string
}

const MyDeliveriesPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'assigned' | 'in-transit' | 'delivered'>('pending')
  
  // Modals
  const [acceptRejectModal, setAcceptRejectModal] = useState<{
    isOpen: boolean
    order: OrderDisplay | null
  }>({ isOpen: false, order: null })
  
  const [issueReportModal, setIssueReportModal] = useState<{
    isOpen: boolean
    order: OrderDisplay | null
  }>({ isOpen: false, order: null })

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
          customerName: o.user?.name || 'Customer',
          address: orderService.formatAddress(o.deliveryAddress),
          totalAmount: o.totalAmount || 0,
          deliveryStatus: o.deliveryStatus || 'pending',
          assignmentStatus: o.assignmentStatus,
          phone: o.user?.phone,
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
    
    // Set up polling for order refresh every 15 seconds
    const ordersInterval = setInterval(() => {
      fetchOrders()
    }, 15000)
    
    // Cleanup
    return () => {
      clearInterval(ordersInterval)
    }
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
      toast.success('Delivery status updated successfully')
    } catch (err) {
      console.error('Error updating delivery status:', err)
      toast.error('Failed to update delivery status')
    }
  }

  const handleAcceptOrder = async () => {
    if (!acceptRejectModal.order) return
    
    try {
      await orderService.acceptOrder(acceptRejectModal.order.id)
      
      // Update in frontend
      setOrders(prev =>
        prev.map(o =>
          o.id === acceptRejectModal.order!.id 
            ? { ...o, assignmentStatus: 'accepted', deliveryStatus: 'assigned' } 
            : o
        )
      )
      
      toast.success('Order accepted successfully! 🎉')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to accept order'
      toast.error(errorMsg)
      throw err
    }
  }

  const handleRejectOrder = async (reason: string) => {
    if (!acceptRejectModal.order) return
    
    try {
      await orderService.rejectOrder(acceptRejectModal.order.id, reason)
      
      // Remove from list or mark as rejected
      setOrders(prev =>
        prev.filter(o => o.id !== acceptRejectModal.order!.id)
      )
      
      toast.success('Order rejected. It will be reassigned.')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to reject order'
      toast.error(errorMsg)
      throw err
    }
  }

  const handleReportIssue = async (
    issueType: string,
    description: string,
    latitude?: number,
    longitude?: number
  ) => {
    if (!issueReportModal.order) return
    
    try {
      await orderService.reportIssue(
        issueReportModal.order.id,
        issueType,
        description,
        latitude,
        longitude
      )
      
      toast.success('Issue reported successfully. Admin has been notified.')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to report issue'
      toast.error(errorMsg)
      throw err
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
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-[#5E372E]">{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderService.getDeliveryStatusClass(order.deliveryStatus)}`}>
                          {orderService.getDeliveryStatusLabel(order.deliveryStatus)}
                        </span>
                        {order.assignmentStatus === 'pending' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            ⏳ Awaiting Response
                          </span>
                        )}
                        {order.assignmentStatus === 'accepted' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Accepted
                          </span>
                        )}
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

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {/* Accept/Reject for pending assignments */}
                      {order.assignmentStatus === 'pending' && (
                        <button
                          onClick={() => setAcceptRejectModal({ isOpen: true, order })}
                          className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          Accept/Reject
                        </button>
                      )}

                      {/* Start delivery for accepted/assigned orders */}
                      {(order.assignmentStatus === 'accepted' || order.deliveryStatus === 'assigned') && 
                       order.deliveryStatus !== 'in-transit' && 
                       order.deliveryStatus !== 'delivered' ? (
                        <button
                          onClick={() => handleStatusChange(order.id, 'in-transit')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          🚚 Start Delivery
                        </button>
                      ) : null}

                      {/* Mark delivered for in-transit orders */}
                      {order.deliveryStatus === 'in-transit' ? (
                        <button
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          ✓ Mark Delivered
                        </button>
                      ) : null}

                      {/* Report issue for active deliveries */}
                      {order.deliveryStatus !== 'delivered' && order.assignmentStatus !== 'pending' && (
                        <button
                          onClick={() => setIssueReportModal({ isOpen: true, order })}
                          className="px-4 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          🚨 Report Issue
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Accept/Reject Modal */}
      {acceptRejectModal.order && (
        <AcceptRejectModal
          isOpen={acceptRejectModal.isOpen}
          onClose={() => setAcceptRejectModal({ isOpen: false, order: null })}
          order={{
            id: acceptRejectModal.order.id,
            orderNumber: acceptRejectModal.order.orderNumber,
            customerName: acceptRejectModal.order.customerName,
            address: acceptRejectModal.order.address,
            totalAmount: acceptRejectModal.order.totalAmount
          }}
          onAccept={handleAcceptOrder}
          onReject={handleRejectOrder}
        />
      )}

      {/* Issue Report Modal */}
      {issueReportModal.order && (
        <IssueReportModal
          isOpen={issueReportModal.isOpen}
          onClose={() => setIssueReportModal({ isOpen: false, order: null })}
          order={{
            id: issueReportModal.order.id,
            orderNumber: issueReportModal.order.orderNumber,
            customerName: issueReportModal.order.customerName
          }}
          onSubmit={handleReportIssue}
        />
      )}

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  )
}

export default MyDeliveriesPage

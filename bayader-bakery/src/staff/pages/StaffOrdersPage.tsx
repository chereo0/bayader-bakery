import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Toaster, toast } from 'react-hot-toast'
import AssignDriverModal from '../components/AssignDriverModal'
import ReportProblemModal from '../components/ReportProblemModal'

interface OrderItem {
  _id: string
  orderNumber: string
  status: 'pending' | 'active' | 'shipped' | 'delivered'
  totalAmount: number
  items: any[]
  deliveryAddress?: {
    city: string
    line1: string
  }
  user?: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  assignedDriver?: {
    _id: string
    name: string
    phone?: string
  }
  notes?: Array<{
    _id: string
    addedBy: {
      name: string
      role: string
    }
    content: string
    createdAt: string
  }>
  createdAt: string
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

interface ConfirmDialog {
  isOpen: boolean
  orderId: string | null
  orderNumber: string | null
  currentStatus: string | null
  nextStatus: string | null
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('token')

const StaffOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    orderId: null,
    orderNumber: null,
    currentStatus: null,
    nextStatus: null
  })
  const [assignDriverModal, setAssignDriverModal] = useState<{
    isOpen: boolean
    order: OrderItem | null
  }>({ isOpen: false, order: null })
  const [reportProblemModal, setReportProblemModal] = useState<{
    isOpen: boolean
    order: OrderItem | null
  }>({ isOpen: false, order: null })

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, page])

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = getToken()
      if (!token) {
        setError('Not authenticated')
        return
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: '20'
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await axios.get(`${API_BASE_URL}/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        setOrders(response.data.data.orders || [])
        setTotal(response.data.data.pagination?.total || 0)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const getNextStatus = (currentStatus: string): string | null => {
    const transitions: Record<string, string | null> = {
      'pending': 'active',
      'active': 'shipped',
      'shipped': 'delivered',
      'delivered': null
    }
    return transitions[currentStatus] || null
  }

  const getButtonLabel = (currentStatus: string): string => {
    const labels: Record<string, string> = {
      'pending': '▶ Start Preparing',
      'active': '✓ Mark Ready',
      'shipped': '📦 Mark Delivered'
    }
    return labels[currentStatus] || ''
  }

  const openConfirmDialog = (order: OrderItem) => {
    const nextStatus = getNextStatus(order.status)
    if (nextStatus) {
      setConfirmDialog({
        isOpen: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        nextStatus
      })
    }
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      orderId: null,
      orderNumber: null,
      currentStatus: null,
      nextStatus: null
    })
  }

  const handleStatusUpdate = async () => {
    if (!confirmDialog.orderId || !confirmDialog.nextStatus) return

    try {
      setUpdatingOrderId(confirmDialog.orderId)
      const token = getToken()

      const response = await axios.patch(
        `${API_BASE_URL}/orders/${confirmDialog.orderId}/status`,
        { status: confirmDialog.nextStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        // Update local state
        setOrders(prev => prev.map(order =>
          order._id === confirmDialog.orderId
            ? { ...order, status: confirmDialog.nextStatus as any }
            : order
        ))
        addToast(`Order #${confirmDialog.orderNumber} updated to ${confirmDialog.nextStatus}`, 'success')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update order'
      addToast(errorMessage, 'error')
      console.error('Error updating order status:', err)
    } finally {
      setUpdatingOrderId(null)
      closeConfirmDialog()
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#5E372E] dark:text-[#d4a574]">Orders Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage orders for production and fulfillment</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
          <select
            title="Filter by Order Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
              toast.type === 'success' ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c79a63]"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading orders...</p>
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No orders found</p>
                <p className="text-gray-500 dark:text-gray-500 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Delivery City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => {
                      const nextStatus = getNextStatus(order.status)
                      const isUpdating = updatingOrderId === order._id
                      
                      return (
                        <React.Fragment key={order._id}>
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-[#5E372E] dark:text-[#d4a574]">
                              #{order.orderNumber}
                              {order.user && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {order.user.name}
                                  {order.user.phone && <span className="ml-2">📞 {order.user.phone}</span>}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              {order.assignedDriver && (
                                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  🚗 {order.assignedDriver.name}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {order.items?.length || 0} item(s)
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-[#5E372E] dark:text-[#d4a574]">
                              {order.totalAmount?.toFixed(2)} SAR
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {order.deliveryAddress?.city || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex flex-col gap-2">
                                {nextStatus && (
                                  <button
                                    onClick={() => openConfirmDialog(order)}
                                    disabled={isUpdating}
                                    className="px-3 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b8885a] dark:bg-[#a0794a] dark:hover:bg-[#8f6a3b] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-xs"
                                  >
                                    {isUpdating ? '⏳ Updating...' : getButtonLabel(order.status)}
                                  </button>
                                )}
                                {order.status === 'shipped' && !order.assignedDriver && (
                                  <button
                                    onClick={() => setAssignDriverModal({ isOpen: true, order })}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium"
                                  >
                                    🚗 Assign Driver
                                  </button>
                                )}
                                <button
                                  onClick={() => setReportProblemModal({ isOpen: true, order })}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
                                >
                                  ⚠️ Report Issue
                                </button>
                                {!nextStatus && (
                                  <span className="text-gray-500 dark:text-gray-400 text-xs text-center">✓ Complete</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 20 >= total}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-[#5E372E] dark:text-[#d4a574] mb-4">Confirm Status Update</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Order <span className="font-semibold">#{confirmDialog.orderNumber}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Update status from <span className="font-semibold text-blue-600 dark:text-blue-400">{confirmDialog.currentStatus}</span> to{' '}
              <span className="font-semibold text-green-600 dark:text-green-400">{confirmDialog.nextStatus}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeConfirmDialog}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingOrderId === confirmDialog.orderId}
                className="flex-1 px-4 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b8885a] dark:bg-[#a0794a] dark:hover:bg-[#8f6a3b] disabled:opacity-50 font-medium transition-colors"
              >
                {updatingOrderId === confirmDialog.orderId ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {assignDriverModal.order && (
        <AssignDriverModal
          isOpen={assignDriverModal.isOpen}
          onClose={() => setAssignDriverModal({ isOpen: false, order: null })}
          order={assignDriverModal.order}
          onAssignSuccess={() => {
            fetchOrders()
          }}
        />
      )}

      {/* Report Problem Modal */}
      {reportProblemModal.order && (
        <ReportProblemModal
          isOpen={reportProblemModal.isOpen}
          onClose={() => setReportProblemModal({ isOpen: false, order: null })}
          order={reportProblemModal.order}
          onReportSuccess={() => {
            fetchOrders()
          }}
        />
      )}

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  )
}

export default StaffOrdersPage

import React, { useState, useEffect } from 'react'

interface Order {
  _id: string
  status: string
}

interface OrderStatusModalProps {
  order: Order
  onStatusChange: (newStatus: string) => void
  onClose: () => void
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ order, onStatusChange, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status)

  // Define valid status transitions
  // Handles both old and new status enums for backward compatibility
  const validTransitions: Record<string, string[]> = {
    'pending': ['active', 'delivered', 'confirmed'],
    'active': ['shipped', 'delivered', 'preparing', 'out-for-delivery'],
    'shipped': ['delivered', 'out-for-delivery'],
    'delivered': [],
    // Old status values support:
    'confirmed': ['preparing', 'out-for-delivery', 'delivered', 'active'],
    'preparing': ['out-for-delivery', 'shipped', 'active'],
    'out-for-delivery': ['delivered', 'shipped'],
  }

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-700' },
    { value: 'active', label: 'Active (Preparing)', color: 'text-blue-700' },
    { value: 'shipped', label: 'Shipped (Packaging Complete)', color: 'text-orange-700' },
    { value: 'delivered', label: 'Delivered', color: 'text-green-700' },
    // Old statuses (for backward compatibility):
    { value: 'confirmed', label: 'Confirmed', color: 'text-blue-700' },
    { value: 'preparing', label: 'Preparing', color: 'text-purple-700' },
    { value: 'out-for-delivery', label: 'Out for Delivery', color: 'text-orange-700' },
  ]

  // Get available transitions for current status
  const currentStatus = (order.status || 'pending').toLowerCase().trim()
  const availableTransitions = validTransitions[currentStatus] || []
  const availableStatuses = statuses.filter(s => availableTransitions.includes(s.value))

  // Debug: Log the current status and available transitions
  console.log('Order Status Modal Debug:', {
    rawStatus: order.status,
    currentStatus,
    availableTransitions,
    availableStatusesCount: availableStatuses.length,
    availableStatusesLabels: availableStatuses.map(s => s.label),
    allTransitionKeys: Object.keys(validTransitions)
  })

  const handleConfirm = () => {
    if (availableTransitions.includes(selectedStatus)) {
      onStatusChange(selectedStatus)
    }
  }

  useEffect(() => {
    setSelectedStatus(availableStatuses.length > 0 ? availableStatuses[0].value : order.status)
  }, [order.status, availableStatuses])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-[#5E372E] mb-4">Update Order Status</h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Order ID: <span className="font-mono font-bold">{order._id.slice(-8)}</span></p>
          <p className="text-sm text-gray-600 mb-4">Current Status: <span className="font-bold capitalize">{order.status.replace('-', ' ')}</span></p>

          <label className="block text-sm font-medium text-[#5E372E] mb-2">Select New Status</label>
          
          {availableStatuses.length > 0 ? (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]"
            >
              {availableStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-gray-100 rounded text-sm text-gray-600">
              This order has reached its final status and cannot be changed.
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={availableStatuses.length === 0}
            className="px-4 py-2 rounded bg-[#6b3f2f] text-white hover:bg-[#5a2e1a] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderStatusModal

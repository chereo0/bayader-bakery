import React, { useState } from 'react'

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

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-700' },
    { value: 'confirmed', label: 'Confirmed', color: 'text-blue-700' },
    { value: 'preparing', label: 'Preparing', color: 'text-purple-700' },
    { value: 'out-for-delivery', label: 'Out for Delivery', color: 'text-orange-700' },
    { value: 'delivered', label: 'Delivered', color: 'text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-700' },
  ]

  const handleConfirm = () => {
    onStatusChange(selectedStatus)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-[#5E372E] mb-4">Update Order Status</h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Order ID: <span className="font-mono font-bold">{order._id.slice(-8)}</span></p>
          <p className="text-sm text-gray-600 mb-4">Current Status: <span className="font-bold capitalize">{order.status.replace('-', ' ')}</span></p>

          <label className="block text-sm font-medium text-[#5E372E] mb-2">Select New Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
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
            className="px-4 py-2 rounded bg-[#6b3f2f] text-white hover:bg-[#5a2e1a] transition"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderStatusModal

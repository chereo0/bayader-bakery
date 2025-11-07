import React from 'react'
import Button from './ui/Button'

interface OrderItem {
  product: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface DeliveryAddress {
  line1: string
  line2?: string
  city: string
  postalCode?: string
  country: string
  phone: string
}

interface Payment {
  method: string
  paid: boolean
  transactionId?: string
}

interface Order {
  _id: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'
  deliveryAddress: DeliveryAddress
  payment: Payment
  createdAt: string
  updatedAt: string
}

interface OrderDetailsModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onCancel?: (orderId: string) => Promise<void>
  isCancelling?: boolean
}

export default function OrderDetailsModal({ 
  order, 
  isOpen, 
  onClose, 
  onCancel,
  isCancelling = false
}: OrderDetailsModalProps) {
  if (!isOpen) return null

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

  const handleCancelClick = async () => {
    if (window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      if (onCancel) {
        await onCancel(order._id)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-bakery-900 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display">Order Details</h2>
            <p className="text-bakery-100 text-sm mt-1">Order ID: {order._id.slice(-8).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-bakery-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status and Date */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-bakery-200">
            <div>
              <p className="text-sm text-bakery-600 mb-2">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-bakery-600 mb-1">Ordered on</p>
              <p className="text-bakery-900 font-medium">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6 pb-6 border-b border-bakery-200">
            <h3 className="text-lg font-semibold text-bakery-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-bakery-900">{item.name}</p>
                        <p className="text-sm text-bakery-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-bakery-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-bakery-600">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6 pb-6 border-b border-bakery-200">
            <h3 className="text-lg font-semibold text-bakery-900 mb-3">Delivery Address</h3>
            <div className="bg-bakery-50 p-4 rounded-lg">
              <p className="text-bakery-900">{order.deliveryAddress.line1}</p>
              {order.deliveryAddress.line2 && (
                <p className="text-bakery-900">{order.deliveryAddress.line2}</p>
              )}
              <p className="text-bakery-900">
                {order.deliveryAddress.city}
                {order.deliveryAddress.postalCode && `, ${order.deliveryAddress.postalCode}`}
              </p>
              <p className="text-bakery-900">{order.deliveryAddress.country}</p>
              <p className="text-bakery-900 mt-2">📞 {order.deliveryAddress.phone}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-6 pb-6 border-b border-bakery-200">
            <h3 className="text-lg font-semibold text-bakery-900 mb-3">Payment Information</h3>
            <div className="bg-bakery-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-bakery-700">Payment Method:</span>
                <span className="text-bakery-900 font-medium capitalize">{order.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bakery-700">Payment Status:</span>
                <span className={`font-semibold ${order.payment.paid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.payment.paid ? '✓ Paid' : '⏳ Pending'}
                </span>
              </div>
              {order.payment.transactionId && (
                <div className="flex justify-between mt-2">
                  <span className="text-bakery-700">Transaction ID:</span>
                  <span className="text-bakery-600 text-sm">{order.payment.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="mb-6 pb-6 border-b border-bakery-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-bakery-900">Total Amount:</span>
              <span className="text-2xl font-bold text-bakery-900">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-bakery-900 mb-3">Order Timeline</h3>
            <div className="space-y-2 text-sm">
              <p className="text-bakery-700">
                📅 <strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}
              </p>
              {order.updatedAt && (
                <p className="text-bakery-700">
                  ✏️ <strong>Last Updated:</strong> {new Date(order.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {order.status === 'pending' && onCancel && (
              <button
                onClick={handleCancelClick}
                disabled={isCancelling}
                className="inline-flex items-center justify-center px-5 py-2 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-red-700 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

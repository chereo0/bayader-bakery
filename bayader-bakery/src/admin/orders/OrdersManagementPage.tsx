import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import OrderStatusModal from './OrderStatusModal'

interface Order {
  _id: string
  user: { _id: string; name: string; email: string }
  items: Array<{ name: string; quantity: number; price: number }>
  totalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'
  deliveryAddress: { city: string; phone: string }
  payment: { method: string; paid: boolean }
  createdAt: string
}

const OrdersManagementPage: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const statuses = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled']
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    'out-for-delivery': 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) return
      setLoading(true)
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const statusParam = statusFilter === 'all' ? '' : `status=${statusFilter}&`
        const res = await fetch(`${API_URL}/orders?${statusParam}page=${currentPage}&limit=20`, { headers })
        if (res.ok) {
          const j = await res.json()
          if (j.success && j.data.orders) {
            setOrders(j.data.orders)
          }
        }
      } catch (err) {
        console.error('Failed to load orders', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [token, statusFilter, currentPage, API_URL])

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder || !token) return
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
      const res = await fetch(`${API_URL}/orders/${selectedOrder._id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const j = await res.json()
        if (j.success) {
          setOrders(orders.map(o => (o._id === selectedOrder._id ? j.data : o)))
          setShowModal(false)
          setSelectedOrder(null)
        }
      }
    } catch (err) {
      console.error('Failed to update order status', err)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#5E372E] mb-6">Orders Management</h1>

      <div className="bg-white p-4 rounded shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setStatusFilter('all'); setCurrentPage(1) }}
              className={`px-4 py-2 rounded transition ${
                statusFilter === 'all'
                  ? 'bg-[#6b3f2f] text-white'
                  : 'bg-[#f0e6de] text-[#5E372E] hover:bg-[#e8d9cc]'
              }`}
            >
              All Orders
            </button>
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setCurrentPage(1) }}
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
            {loading ? 'Loading...' : `${orders.length} orders`}
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f5f1e8] border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-[#5E372E]">Order ID</th>
              <th className="px-4 py-3 font-medium text-[#5E372E]">Customer</th>
              <th className="px-4 py-3 font-medium text-[#5E372E]">Items</th>
              <th className="px-4 py-3 font-medium text-[#5E372E]">Total</th>
              <th className="px-4 py-3 font-medium text-[#5E372E]">Status</th>
              <th className="px-4 py-3 font-medium text-[#5E372E]">Date</th>
              <th className="px-4 py-3 font-medium text-[#5E372E]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-[#fafaf8] transition">
                <td className="px-4 py-3 font-mono text-xs">{order._id.slice(-8)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{order.user?.name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{order.user?.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    {order.items.map((item, i) => (
                      <div key={i}>{item.quantity}x {item.name}</div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-bold">${Number(order.totalAmount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-100'}`}>
                    {order.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowModal(true)
                    }}
                    className="bg-[#6b3f2f] text-white px-3 py-1 rounded text-xs hover:bg-[#5a2e1a] transition"
                  >
                    Update Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No orders found
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded bg-[#f0e6de] text-[#5E372E] disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-2">Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-2 rounded bg-[#f0e6de] text-[#5E372E]"
        >
          Next
        </button>
      </div>

      {showModal && selectedOrder && (
        <OrderStatusModal
          order={selectedOrder}
          onStatusChange={handleStatusChange}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default OrdersManagementPage

import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

interface Order {
  _id: string
  orderId: string
  status: string
  totalAmount: number
}

interface Driver {
  _id: string
  name: string
  status: string
}

interface QuickActionsProps {
  onOrderAssigned?: () => void
  onIssueReported?: () => void
}

const QuickActions: React.FC<QuickActionsProps> = ({ onOrderAssigned, onIssueReported }) => {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')
  const [issueDescription, setIssueDescription] = useState('')
  const [issuePriority, setIssuePriority] = useState('normal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
  const [fetchingData, setFetchingData] = useState(false)

  const token = localStorage.getItem('token')

  // Fetch available orders and drivers when modal opens
  useEffect(() => {
    if (showAssignModal) {
      fetchOrdersAndDrivers()
    }
  }, [showAssignModal])

  const fetchOrdersAndDrivers = async () => {
    try {
      console.log('[QuickActions] 🔵 Fetching orders and drivers...')
      setFetchingData(true)
      setError(null)

      // Fetch active orders (ready to be assigned)
      console.log('[QuickActions] 📧 Fetching active orders from:', `${API_BASE_URL}/orders?status=active`)
      const ordersResponse = await fetch(`${API_BASE_URL}/orders?status=active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Fetch all drivers (we'll filter by status if available)
      console.log('[QuickActions] 📧 Fetching available drivers from:', `${API_BASE_URL}/drivers?status=available`)
      const driversResponse = await fetch(`${API_BASE_URL}/drivers?status=available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        // Handle both response formats: data.orders and data array
        const ordersList = ordersData.data?.orders || ordersData.data || []
        console.log('[QuickActions] ✅ Orders fetched:', ordersList.length, 'orders')
        setAvailableOrders(ordersList)
      } else {
        console.warn('[QuickActions] ⚠️ Orders response not ok:', ordersResponse.status)
        setAvailableOrders([])
      }

      if (driversResponse.ok) {
        const driversData = await driversResponse.json()
        // Handle both response formats: data array and nested structure
        const driversList = Array.isArray(driversData.data) ? driversData.data : driversData.data?.drivers || []
        console.log('[QuickActions] ✅ Drivers fetched:', driversList.length, 'drivers')
        setAvailableDrivers(driversList)
      } else {
        console.warn('[QuickActions] ⚠️ Drivers response not ok:', driversResponse.status)
        setAvailableDrivers([])
      }
    } catch (err) {
      console.error('[QuickActions] ❌ Error fetching data:', err)
      // Continue anyway with empty lists
    } finally {
      setFetchingData(false)
    }
  }

  // Assign Ready Order
  const handleAssignOrder = async () => {
    try {
      console.log('[QuickActions] 🔵 handleAssignOrder called')
      setLoading(true)
      setError(null)
      setSuccess(null)

      if (!selectedOrder) {
        console.warn('[QuickActions] ⚠️ No order selected')
        setError('Please select an order')
        setLoading(false)
        return
      }

      if (!selectedDriver) {
        console.warn('[QuickActions] ⚠️ No driver selected')
        setError('Please select a driver')
        setLoading(false)
        return
      }

      const assignUrl = `${API_BASE_URL}/deliveries/${selectedOrder}/assign`
      console.log('[QuickActions] 📧 Sending assignment request to:', assignUrl)
      console.log('[QuickActions] 📋 Payload:', { driverId: selectedDriver })
      const response = await fetch(assignUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ driverId: selectedDriver })
      })

      if (!response.ok) {
        console.error('[QuickActions] ❌ Assignment failed, status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to assign order')
      }

      console.log('[QuickActions] ✅ Order assigned successfully!')
      setSuccess('Order assigned successfully!')
      setSelectedOrder('')
      setSelectedDriver('')
      setTimeout(() => {
        setShowAssignModal(false)
        onOrderAssigned?.()
      }, 1500)
    } catch (err: any) {
      console.error('[QuickActions] ❌ Error in handleAssignOrder:', err.message)
      setError(err.message || 'Failed to assign order')
    } finally {
      setLoading(false)
    }
  }

  // Report Production Issue
  const handleReportIssue = async () => {
    try {
      console.log('[QuickActions] 🔵 handleReportIssue called')
      setLoading(true)
      setError(null)
      setSuccess(null)

      if (!issueDescription.trim()) {
        console.warn('[QuickActions] ⚠️ Issue description is empty')
        setError('Please describe the issue')
        setLoading(false)
        return
      }

      const payload = {
        recipientId: '', // Admin will receive this
        type: 'alert',
        title: 'Production Issue Reported',
        message: issueDescription,
        priority: issuePriority,
        category: 'production'
      }
      console.log('[QuickActions] 📧 Sending issue report to:', `${API_BASE_URL}/notifications`)
      console.log('[QuickActions] 📋 Payload:', payload)
      // Create a notification for the issue
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.error('[QuickActions] ❌ Report failed, status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to report issue')
      }

      console.log('[QuickActions] ✅ Issue reported successfully!')
      setSuccess('Issue reported successfully!')
      setIssueDescription('')
      setIssuePriority('normal')
      setTimeout(() => {
        setShowIssueModal(false)
        onIssueReported?.()
      }, 1500)
    } catch (err: any) {
      console.error('[QuickActions] ❌ Error in handleReportIssue:', err.message)
      setError(err.message || 'Failed to report issue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
      <h3 className="text-lg font-semibold text-[#5E372E]">Quick Actions</h3>
      
      <button
        onClick={() => setShowAssignModal(true)}
        className="w-full px-4 py-3 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors font-medium flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Assign Ready Order
      </button>

      <button
        onClick={() => setShowIssueModal(true)}
        className="w-full px-4 py-3 border-2 border-[#5E372E] text-[#5E372E] rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Report Production Issue
      </button>

      {/* Assign Order Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#5E372E] mb-4">Assign Ready Order</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Order
                </label>
                {fetchingData ? (
                  <div className="p-3 bg-gray-100 rounded text-gray-600 text-sm">Loading orders...</div>
                ) : availableOrders.length > 0 ? (
                  <select
                    title="Select Order"
                    value={selectedOrder}
                    onChange={(e) => setSelectedOrder(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                  >
                    <option value="">Choose an order...</option>
                    {availableOrders.map(order => (
                      <option key={order._id} value={order._id}>
                        Order #{order.orderId} - ${order.totalAmount.toFixed(2)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
                    No ready orders available for assignment
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Driver
                </label>
                {fetchingData ? (
                  <div className="p-3 bg-gray-100 rounded text-gray-600 text-sm">Loading drivers...</div>
                ) : availableDrivers.length > 0 ? (
                  <select
                    title="Select Driver"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                  >
                    <option value="">Choose a driver...</option>
                    {availableDrivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} - {driver.status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
                    No available drivers found
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignOrder}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] disabled:opacity-50 font-medium"
                >
                  {loading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#5E372E] mb-4">Report Production Issue</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  title="Issue Priority"
                  value={issuePriority}
                  onChange={(e) => setIssuePriority(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Description
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  disabled={loading}
                  placeholder="Describe the production issue..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E] resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowIssueModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportIssue}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#D97706] text-white rounded-md hover:bg-[#b8560f] disabled:opacity-50 font-medium"
                >
                  {loading ? 'Reporting...' : 'Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickActions

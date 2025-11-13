import React, { useState } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

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

  const token = localStorage.getItem('token')

  // Assign Ready Order
  const handleAssignOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      if (!selectedOrder) {
        setError('Please select an order')
        return
      }

      if (!selectedDriver) {
        setError('Please select a driver')
        return
      }

      const response = await fetch(`${API_BASE_URL}/deliveries/${selectedOrder}/assign`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ driverId: selectedDriver })
      })

      if (!response.ok) {
        throw new Error('Failed to assign order')
      }

      setSuccess('Order assigned successfully!')
      setSelectedOrder('')
      setSelectedDriver('')
      setTimeout(() => {
        setShowAssignModal(false)
        onOrderAssigned?.()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to assign order')
    } finally {
      setLoading(false)
    }
  }

  // Report Production Issue
  const handleReportIssue = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      if (!issueDescription.trim()) {
        setError('Please describe the issue')
        return
      }

      // Create a notification for the issue
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: '', // Admin will receive this
          type: 'alert',
          title: 'Production Issue Reported',
          message: issueDescription,
          priority: issuePriority,
          category: 'production'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to report issue')
      }

      setSuccess('Issue reported successfully!')
      setIssueDescription('')
      setIssuePriority('normal')
      setTimeout(() => {
        setShowIssueModal(false)
        onIssueReported?.()
      }, 1500)
    } catch (err: any) {
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
                <select
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                >
                  <option value="">Choose an order...</option>
                  <option value="order-001">Order #001 - 3 Layer Cake</option>
                  <option value="order-002">Order #002 - Chocolate Brownies</option>
                  <option value="order-003">Order #003 - Wedding Cake</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Driver
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                >
                  <option value="">Choose a driver...</option>
                  <option value="driver-001">Ahmed Hassan</option>
                  <option value="driver-002">Mohammed Ali</option>
                  <option value="driver-003">Fatima Khan</option>
                </select>
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

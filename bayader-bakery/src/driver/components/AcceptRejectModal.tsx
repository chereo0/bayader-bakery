import React, { useState } from 'react'

interface AcceptRejectModalProps {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    orderNumber: string
    customerName: string
    address: string
    totalAmount: number
  }
  onAccept: () => Promise<void>
  onReject: (reason: string) => Promise<void>
}

const AcceptRejectModal: React.FC<AcceptRejectModalProps> = ({
  isOpen,
  onClose,
  order,
  onAccept,
  onReject
}) => {
  const [mode, setMode] = useState<'choice' | 'reject'>('choice')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAccept = async () => {
    setLoading(true)
    setError('')
    try {
      await onAccept()
      onClose()
      resetState()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept order')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (reason.trim().length < 5) {
      setError('Rejection reason must be at least 5 characters')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onReject(reason.trim())
      onClose()
      resetState()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject order')
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setMode('choice')
    setReason('')
    setError('')
    setLoading(false)
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      resetState()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {mode === 'choice' ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-[#5E372E] dark:text-white">
              Order Assignment - {order.orderNumber}
            </h2>

            <div className="mb-6 p-4 bg-[#fffaf4] dark:bg-gray-700 rounded-lg border border-[#f3e7d9]">
              <p className="text-sm text-[#6b4f45] dark:text-gray-300 mb-2">
                <strong>Customer:</strong> {order.customerName}
              </p>
              <p className="text-sm text-[#6b4f45] dark:text-gray-300 mb-2">
                <strong>Address:</strong> {order.address}
              </p>
              <p className="text-sm font-semibold text-[#5E372E] dark:text-white">
                <strong>Amount:</strong> ${order.totalAmount.toFixed(2)}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Accepting...' : '✓ Accept Order'}
              </button>
              <button
                onClick={() => setMode('reject')}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                ✗ Reject Order
              </button>
            </div>

            <button
              onClick={handleClose}
              disabled={loading}
              className="w-full mt-3 px-4 py-2 border border-[#f3e7d9] text-[#5E372E] rounded-md hover:bg-[#f9f3eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-[#5E372E] dark:text-white">
              Reject Order - {order.orderNumber}
            </h2>

            <p className="text-sm text-[#6b4f45] dark:text-gray-300 mb-4">
              Please provide a reason for rejecting this order (minimum 5 characters):
            </p>

            <div className="mb-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Vehicle breakdown, Personal emergency, Too far from current location..."
                className="w-full border border-[#f3e7d9] dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E] dark:bg-gray-700 dark:text-white min-h-[100px]"
                disabled={loading}
                aria-label="Rejection reason"
              />
              <p className="text-xs text-[#6b4f45] dark:text-gray-400 mt-1">
                {reason.length}/5 characters minimum
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={loading || reason.trim().length < 5}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Submitting...' : 'Submit Rejection'}
              </button>
              <button
                onClick={() => {
                  setMode('choice')
                  setReason('')
                  setError('')
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-[#f3e7d9] text-[#5E372E] rounded-md hover:bg-[#f9f3eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AcceptRejectModal

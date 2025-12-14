import React, { useState, useEffect } from 'react'

interface IssueReportModalProps {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    orderNumber: string
    customerName: string
  }
  onSubmit: (issueType: string, description: string, latitude?: number, longitude?: number) => Promise<void>
}

const ISSUE_TYPES = [
  { value: 'customer-unavailable', label: 'Customer Unavailable' },
  { value: 'wrong-address', label: 'Wrong Address' },
  { value: 'access-denied', label: 'Access Denied' },
  { value: 'damaged-product', label: 'Damaged Product' },
  { value: 'payment-issue', label: 'Payment Issue' },
  { value: 'traffic-delay', label: 'Traffic Delay' },
  { value: 'vehicle-breakdown', label: 'Vehicle Breakdown' },
  { value: 'other', label: 'Other' },
]

const IssueReportModal: React.FC<IssueReportModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmit
}) => {
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [useLocation, setUseLocation] = useState(false)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (useLocation && !location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (err) => {
          console.error('Failed to get location:', err)
          setError('Failed to get GPS location. Please try again.')
          setUseLocation(false)
        }
      )
    }
  }, [useLocation])

  const handleSubmit = async () => {
    if (!issueType) {
      setError('Please select an issue type')
      return
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit(
        issueType,
        description.trim(),
        location?.latitude,
        location?.longitude
      )
      
      onClose()
      resetState()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit issue report')
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setIssueType('')
    setDescription('')
    setUseLocation(false)
    setLocation(null)
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-[#5E372E] dark:text-white">
          Report Delivery Issue
        </h2>

        <div className="mb-4 p-3 bg-[#fffaf4] dark:bg-gray-700 rounded-lg border border-[#f3e7d9]">
          <p className="text-sm text-[#6b4f45] dark:text-gray-300">
            <strong>Order:</strong> {order.orderNumber}
          </p>
          <p className="text-sm text-[#6b4f45] dark:text-gray-300">
            <strong>Customer:</strong> {order.customerName}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-[#6b4f45] dark:text-gray-300 mb-2">
              Issue Type *
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full border border-[#f3e7d9] dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E] dark:bg-gray-700 dark:text-white"
              disabled={loading}
              aria-label="Select issue type"
            >
              <option value="">Select an issue type...</option>
              {ISSUE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#6b4f45] dark:text-gray-300 mb-2">
              Description * (min. 10 characters)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about the issue..."
              className="w-full border border-[#f3e7d9] dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E] dark:bg-gray-700 dark:text-white min-h-[100px]"
              disabled={loading}
              aria-label="Issue description"
            />
            <p className="text-xs text-[#6b4f45] dark:text-gray-400 mt-1">
              {description.length}/10 characters minimum
            </p>
          </div>

          {/* GPS Location */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useLocation"
              checked={useLocation}
              onChange={(e) => setUseLocation(e.target.checked)}
              className="w-4 h-4 text-[#5E372E] border-gray-300 rounded focus:ring-[#5E372E]"
              disabled={loading}
            />
            <label htmlFor="useLocation" className="text-sm text-[#6b4f45] dark:text-gray-300">
              Include GPS location
            </label>
            {location && (
              <span className="text-xs text-green-600 dark:text-green-400">
                ✓ Location captured
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading || !issueType || description.trim().length < 10}
            className="flex-1 px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-[#f3e7d9] text-[#5E372E] rounded-md hover:bg-[#f9f3eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default IssueReportModal

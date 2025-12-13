import React, { useState, useEffect } from 'react'
import { Delivery, deliveries as initialDeliveries, summaryStats } from './data'
import SummaryCard from './SummaryCards'
import DeliveryTable from './DeliveryTable'
import deliveryService from './services/deliveryService'
import locationService from './services/locationService'

interface BackendDelivery {
  _id: string
  deliveryAddress: string
  status: string
  order: {
    _id: string
    totalAmount: number
    status: string
  }
  driver?: {
    _id: string
    name: string
    email: string
    phone: string
  }
  estimatedDeliveryDate: string
  actualDeliveryDate?: string
}

const DeliveryDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'on-way' | 'delivered'>('pending')
  const [selectedOrder, setSelectedOrder] = useState<string>('')
  const [updateStatus, setUpdateStatus] = useState<Delivery['status']>('picked')
  const [reportIssueOpen, setReportIssueOpen] = useState(false)
  const [issueReport, setIssueReport] = useState({ orderId: '', description: '', photo: null as File | null })

  // Fetch deliveries from backend
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true)
        const data = await deliveryService.getMyDeliveries()
        
        // Transform backend data to frontend format
        const transformed = data.map((d: BackendDelivery, index: number) => ({
          id: d._id,
          orderId: `#${1000 + index}`,
          customerName: 'Customer',
          address: d.deliveryAddress,
          status: d.status.toLowerCase() as Delivery['status'],
          phone: d.driver?.phone,
          notes: d.order.totalAmount ? `Amount: ${d.order.totalAmount}` : undefined,
        }))
        
        setDeliveries(transformed)
        setError(null)
      } catch (err) {
        console.error('Error fetching deliveries:', err)
        setError('Failed to load deliveries. Using demo data.')
        setDeliveries(initialDeliveries)
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveries()
  }, [])

  const handleStatusChange = async (deliveryId: string, newStatus: Delivery['status']) => {
    try {
      // Map frontend status to backend status
      const backendStatusMap: Record<Delivery['status'], any> = {
        'pending': 'pending',
        'picked': 'picked',
        'on-way': 'in-transit',
        'delivered': 'delivered'
      }
      
      // Update in backend
      await deliveryService.updateDeliveryStatus(deliveryId, backendStatusMap[newStatus])
      
      // Update in frontend
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d))
    } catch (err) {
      console.error('Error updating delivery status:', err)
      alert('Failed to update delivery status')
    }
  }

  const handleConfirmDelivery = async () => {
    if (selectedOrder) {
      await handleStatusChange(selectedOrder, updateStatus)
      setSelectedOrder('')
    }
  }

  const pendingCount = deliveries.filter(d => d.status === 'pending').length
  const onWayCount = deliveries.filter(d => d.status === 'picked' || d.status === 'on-way').length
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length

  return (
    <div className="space-y-6">
      {/* Loading & Error States */}
      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E372E]"></div>
        </div>
      )}

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard title="Total Deliveries" value={deliveries.length} />
            <SummaryCard title="Awaiting Pickup" value={pendingCount} />
            <SummaryCard title="Currently Delivering" value={onWayCount} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Delivery Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#fffaf4] rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#5E372E] mb-4">Assigned Deliveries</h2>
            
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
                  Pending Pickup ({pendingCount})
                </button>
                <button
                  onClick={() => setActiveTab('on-way')}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeTab === 'on-way'
                      ? 'bg-[#fffaf4] text-[#5E372E] border-t-2 border-[#5E372E] -mb-[1px]'
                      : 'bg-transparent text-[#6b4f45] hover:text-[#5E372E]'
                  }`}
                >
                  On the Way ({onWayCount})
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

            <DeliveryTable deliveries={deliveries} activeTab={activeTab} onStatusChange={handleStatusChange} />
          </div>
        </div>

        {/* Right Column - Status Panels */}
        <div className="space-y-6">
          {/* Update Delivery Status Panel */}
          <div className="bg-[#fffaf4] rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Update Delivery Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6b4f45] mb-2">Order ID</label>
                <select
                  value={selectedOrder}
                  onChange={e => {
                    setSelectedOrder(e.target.value)
                    const delivery = deliveries.find(d => d.id === e.target.value)
                    if (delivery) setUpdateStatus(delivery.status)
                  }}
                  aria-label="Select order to update status"
                  className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 bg-white text-[#5E372E]"
                >
                  <option value="">Select Order</option>
                  {deliveries.filter(d => d.status !== 'delivered').map(d => (
                    <option key={d.id} value={d.id}>{d.orderId}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6b4f45] mb-2">Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUpdateStatus('picked')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      updateStatus === 'picked'
                        ? 'bg-[#5E372E] text-white'
                        : 'bg-white border border-[#f3e7d9] text-[#5E372E] hover:bg-[#f9f3eb]'
                    }`}
                  >
                    Picked
                  </button>
                  <button
                    onClick={() => setUpdateStatus('on-way')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      updateStatus === 'on-way'
                        ? 'bg-[#5E372E] text-white'
                        : 'bg-white border border-[#f3e7d9] text-[#5E372E] hover:bg-[#f9f3eb]'
                    }`}
                  >
                    On Way
                  </button>
                  <button
                    onClick={() => setUpdateStatus('delivered')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      updateStatus === 'delivered'
                        ? 'bg-[#5E372E] text-white'
                        : 'bg-white border border-[#f3e7d9] text-[#5E372E] hover:bg-[#f9f3eb]'
                    }`}
                  >
                    Delivered
                  </button>
                </div>
              </div>

              <button
                onClick={handleConfirmDelivery}
                disabled={!selectedOrder}
                className="w-full px-4 py-3 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Delivery
              </button>
            </div>
          </div>

          {/* Today's Route Panel */}
          <div className="bg-[#fffaf4] rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Today's Route</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#6b4f45] mb-4">
                <svg className="w-5 h-5 text-[#c79a63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">View Full Map</span>
              </div>
              <button
                onClick={() => setReportIssueOpen(true)}
                className="w-full px-4 py-3 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors font-medium"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Issue Modal */}
      {reportIssueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Report Delivery Issue</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6b4f45] mb-1">Order ID</label>
                <select
                  value={issueReport.orderId}
                  onChange={e => setIssueReport({ ...issueReport, orderId: e.target.value })}
                  className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                  aria-label="Select order to report issue"
                >
                  <option value="">Select Order</option>
                  {deliveries.filter(d => d.status !== 'delivered').map(d => (
                    <option key={d.id} value={d.orderId}>{d.orderId}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b4f45] mb-1">Issue Description</label>
                <textarea
                  value={issueReport.description}
                  onChange={e => setIssueReport({ ...issueReport, description: e.target.value })}
                  className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                  rows={4}
                  placeholder="Describe the issue..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b4f45] mb-1">Upload Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setIssueReport({ ...issueReport, photo: e.target.files?.[0] || null })}
                  className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                  aria-label="Upload photo of delivery issue"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setReportIssueOpen(false)
                  setIssueReport({ orderId: '', description: '', photo: null })
                }}
                className="px-4 py-2 border border-[#f3e7d9] text-[#5E372E] rounded-md hover:bg-[#f9f3eb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle issue report submission
                  console.log('Issue reported:', issueReport)
                  setReportIssueOpen(false)
                  setIssueReport({ orderId: '', description: '', photo: null })
                  alert('Issue reported successfully!')
                }}
                disabled={!issueReport.orderId || !issueReport.description}
                className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}

export default DeliveryDashboard


import React, { useState } from 'react'
import { Delivery, deliveries as initialDeliveries } from './data'
import DeliveryTable from './DeliveryTable'

const MyDeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries)
  const [activeTab, setActiveTab] = useState<'pending' | 'on-way' | 'delivered'>('pending')

  const handleStatusChange = (deliveryId: string, newStatus: Delivery['status']) => {
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d))
  }

  const pendingCount = deliveries.filter(d => d.status === 'pending').length
  const onWayCount = deliveries.filter(d => d.status === 'picked' || d.status === 'on-way').length
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length

  return (
    <div className="bg-[#fffaf4] rounded-lg shadow-sm min-h-[600px] p-6">
      <h2 className="text-2xl font-semibold text-[#5E372E] mb-6">My Deliveries</h2>
      
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
  )
}

export default MyDeliveriesPage


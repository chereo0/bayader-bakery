import React, { useState } from 'react'
import { Delivery } from './data'

interface DeliveryTableProps {
  deliveries: Delivery[]
  activeTab: 'pending' | 'on-way' | 'delivered'
  onStatusChange: (deliveryId: string, newStatus: Delivery['status']) => void
}

const DeliveryTable: React.FC<DeliveryTableProps> = ({ deliveries, activeTab, onStatusChange }) => {
  const getStatusBadge = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#c79a63] text-white">Pending Pickup</span>
      case 'picked':
      case 'on-way':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#b8864f] text-white">On the Way</span>
      case 'delivered':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#7db36b] text-white">Delivered</span>
      default:
        return null
    }
  }

  const getActionButton = (delivery: Delivery) => {
    if (delivery.status === 'pending') {
      return (
        <button
          onClick={() => onStatusChange(delivery.id, 'picked')}
          className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors text-sm font-medium"
        >
          Pick Up Order
        </button>
      )
    } else if (delivery.status === 'picked' || delivery.status === 'on-way') {
      return (
        <button
          onClick={() => onStatusChange(delivery.id, 'delivered')}
          className="px-4 py-2 bg-[#7db36b] text-white rounded-md hover:bg-[#6fa05d] transition-colors text-sm font-medium"
        >
          Mark Delivered
        </button>
      )
    }
    return null
  }

  const filteredDeliveries = deliveries.filter(d => {
    if (activeTab === 'pending') return d.status === 'pending'
    if (activeTab === 'on-way') return d.status === 'picked' || d.status === 'on-way'
    if (activeTab === 'delivered') return d.status === 'delivered'
    return false
  })

  return (
    <div className="bg-[#fffaf4] rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f9f3eb]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5E372E] uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5E372E] uppercase tracking-wider">Customer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5E372E] uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5E372E] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5E372E] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3e7d9]">
            {filteredDeliveries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No deliveries in this category
                </td>
              </tr>
            ) : (
              filteredDeliveries.map((delivery, idx) => (
                <tr
                  key={delivery.id}
                  className={`hover:bg-[#f9f3eb]/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-[#fffaf4]' : 'bg-[#f9f3eb]'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#5E372E]">{delivery.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b4f45]">{delivery.customerName}</td>
                  <td className="px-6 py-4 text-sm text-[#6b4f45]">{delivery.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(delivery.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getActionButton(delivery)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DeliveryTable


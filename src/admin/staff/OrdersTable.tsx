import React, { useState } from 'react'
import { Order } from './data'
import { pendingOrders, preparingOrders, readyOrders } from './data'

interface TabProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

const Tab: React.FC<TabProps> = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
      active
        ? 'bg-white text-[#5E372E] border-t-2 border-[#5E372E]'
        : 'bg-gray-100 text-gray-600 hover:bg-white'
    }`}
  >
    {label} ({count})
  </button>
)

interface OrdersTableProps {
  orders: Order[]
  status: 'pending' | 'preparing' | 'ready'
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, status }) => {
  const getActionButton = (order: Order) => {
    if (status === 'pending') {
      return (
        <button className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors text-sm font-medium">
          Start Preparing
        </button>
      )
    } else if (status === 'preparing') {
      return (
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
          Mark as Ready
        </button>
      )
    }
    return (
      <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium">
        Assign to Driver
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Time Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#5E372E]">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.timeDue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.customerName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {order.items}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getActionButton(order)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const CurrentCustomerOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready'>('pending')

  const tabs = [
    { key: 'pending', label: 'Pending', count: pendingOrders.length },
    { key: 'preparing', label: 'Preparing', count: preparingOrders.length },
    { key: 'ready', label: 'Ready', count: readyOrders.length },
  ]

  const getOrders = () => {
    if (activeTab === 'pending') return pendingOrders
    if (activeTab === 'preparing') return preparingOrders
    return readyOrders
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200 px-4 bg-gray-100 rounded-t-lg flex gap-1">
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            label={tab.label}
            count={tab.count}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          />
        ))}
      </div>
      <div className="p-4">
        <OrdersTable orders={getOrders()} status={activeTab} />
      </div>
    </div>
  )
}

export default CurrentCustomerOrders


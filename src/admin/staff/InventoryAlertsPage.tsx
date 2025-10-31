import React, { useState } from 'react'
import { ProductItem } from '../products/data'
import productsData from '../products/data'

interface AlertItem {
  id: number
  name: string
  category: string
  currentStock: number
  threshold: number
  priority: 'critical' | 'warning' | 'low'
}

const InventoryAlertsPage: React.FC = () => {
  const [products] = useState<ProductItem[]>(productsData)
  
  const threshold = 10
  const warningThreshold = 20

  const getAlerts = (): AlertItem[] => {
    return products
      .filter(p => (p.stock ?? 0) < warningThreshold)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        currentStock: p.stock ?? 0,
        threshold: (p.stock ?? 0) < threshold ? threshold : warningThreshold,
        priority: (p.stock ?? 0) < threshold ? 'critical' : (p.stock ?? 0) < warningThreshold ? 'warning' : 'low'
      }))
      .sort((a, b) => {
        if (a.priority === 'critical' && b.priority !== 'critical') return -1
        if (b.priority === 'critical' && a.priority !== 'critical') return 1
        return a.currentStock - b.currentStock
      })
  }

  const alerts = getAlerts()

  const getPriorityBadge = (priority: AlertItem['priority']) => {
    switch (priority) {
      case 'critical':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Critical</span>
      case 'warning':
        return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Warning</span>
      default:
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Low</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#5E372E]">Inventory Alerts</h2>
          <div className="text-sm text-gray-600">
            {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} found
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">All inventory levels are healthy</p>
            <p className="text-gray-400 text-sm mt-2">No low stock alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.priority === 'critical'
                    ? 'border-red-200 bg-red-50'
                    : alert.priority === 'warning'
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[#5E372E]">{alert.name}</h3>
                      {getPriorityBadge(alert.priority)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>Category: {alert.category}</span>
                      <span className="mx-2">•</span>
                      <span>Current Stock: <strong className="text-red-600">{alert.currentStock}</strong> units</span>
                      <span className="mx-2">•</span>
                      <span>Threshold: {alert.threshold} units</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors text-sm font-medium">
                      Report Issue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="px-4 py-3 border-2 border-[#5E372E] text-[#5E372E] rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Request Stock Replenishment
          </button>
          <button className="px-4 py-3 border-2 border-[#5E372E] text-[#5E372E] rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Alert Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default InventoryAlertsPage


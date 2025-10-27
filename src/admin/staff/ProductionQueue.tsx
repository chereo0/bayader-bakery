import React from 'react'
import { productionQueue, ProductionItem } from './data'

const ProductionQueue: React.FC = () => {
  const getStatusBadge = (status: ProductionItem['status']) => {
    const styles = {
      baking: 'bg-orange-100 text-orange-800',
      decorating: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
    }
    return styles[status]
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-[#5E372E]">Production Queue</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {productionQueue.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-[#5E372E] border-gray-300 rounded focus:ring-[#5E372E]"
              />
              <div>
                <p className="font-medium text-[#5E372E]">{item.name}</p>
                <p className="text-sm text-gray-600">{item.stage}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)} ({item.quantity})
              </span>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                Mark as Ready
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductionQueue


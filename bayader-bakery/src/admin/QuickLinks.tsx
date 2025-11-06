import React from 'react'

interface QuickLinksProps {
  onNavigate?: (tab: string) => void
}

const QuickLinks: React.FC<QuickLinksProps> = ({ onNavigate }) => {
  const handleClick = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab)
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-medium text-[#5E372E] mb-3">Quick Actions</h3>
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => handleClick('Products')}
          className="bg-[#6b3f2f] text-white px-4 py-2 rounded hover:bg-[#5a2e1a] transition"
        >
          Add New Product
        </button>
        <button 
          onClick={() => handleClick('Products')}
          className="bg-[#f0e6de] text-[#5E372E] px-4 py-2 rounded hover:bg-[#e8d9cc] transition"
        >
          Manage Products
        </button>
        <button 
          onClick={() => handleClick('Inventory')}
          className="bg-[#f0e6de] text-[#5E372E] px-4 py-2 rounded hover:bg-[#e8d9cc] transition"
        >
          View Inventory
        </button>
        <button 
          onClick={() => handleClick('Users')}
          className="bg-[#f0e6de] text-[#5E372E] px-4 py-2 rounded hover:bg-[#e8d9cc] transition"
        >
          Manage Users
        </button>
      </div>
    </div>
  )
}

export default QuickLinks

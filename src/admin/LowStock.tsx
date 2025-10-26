import React from 'react'

const LowStock: React.FC = () => {
  const items = [
    { name: 'Flour (20kg)', qty: 1, tag: 'Delivered' },
    { name: 'Chocolate Chips', qty: 8 },
    { name: 'Butter', qty: 8 }
  ]

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-medium text-[#5E372E] mb-2">Low Stock Alerts</h3>
      <ul className="space-y-2 text-sm text-[#6b4f45]">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between">
            <div>{it.name}</div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">{it.qty} packs</div>
              {it.tag && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{it.tag}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LowStock

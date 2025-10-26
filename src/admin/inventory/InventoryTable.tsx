import React from 'react'
import { ProductItem } from '../products/data'

interface Props {
  products: ProductItem[]
  onEdit: (p: ProductItem) => void
  onAddStock: (p: ProductItem) => void
  onMarkOut: (p: ProductItem) => void
}

const InventoryTable: React.FC<Props> = ({ products, onEdit, onAddStock, onMarkOut }) => {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="py-2">Name</th>
              <th className="py-2">Category</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Price</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr key={p.id} className={`border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3">{p.category}</td>
                <td className="py-3">{p.stock}</td>
                <td className="py-3">${p.price.toFixed(2)}</td>
                <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs ${p.status === 'Out of Stock' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{p.status ?? 'Active'}</span></td>
                <td className="py-3 flex gap-2">
                  <button onClick={()=>onAddStock(p)} className="px-2 py-1 bg-[#d4ac6f] rounded text-sm">+Stock</button>
                  <button onClick={()=>onEdit(p)} className="px-2 py-1 bg-[#6b3f2f] text-white rounded text-sm">Edit</button>
                  <button onClick={()=>onMarkOut(p)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Out</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventoryTable

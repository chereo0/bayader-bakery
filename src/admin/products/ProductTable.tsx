import React, { useState } from 'react'
import { ProductItem } from './data'

interface Props {
  products: ProductItem[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  if (status === 'Active') return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Active</span>
  if (status === 'Out of Stock') return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">Out of Stock</span>
  return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">Draft</span>
}

const ProductTable: React.FC<Props> = ({ products, onEdit, onDelete }) => {
  const [selected, setSelected] = useState<number[]>([])

  const toggle = (id: number) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id])

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-500">
              <th className="py-2 pl-2"><input type="checkbox" onChange={(e:any)=> e.target.checked ? setSelected(products.map(p=>p.id)) : setSelected([])} /></th>
              <th className="py-2">Image</th>
              <th className="py-2">Product Name</th>
              <th className="py-2">Category</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Price</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t hover:bg-neutral-50 transition">
                <td className="py-3 pl-2"><input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggle(p.id)} /></td>
                <td className="py-3"><img src={p.image} alt={p.name} className="w-12 h-12 rounded-full object-cover border" /></td>
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3 text-sm text-[#6b4f45]">{p.category}</td>
                <td className="py-3">{p.stock}</td>
                <td className="py-3">${p.price.toFixed(2)}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    <button onClick={()=>onEdit(p.id)} className="text-sm text-[#5E372E] hover:underline">Edit</button>
                    <button onClick={()=>onDelete(p.id)} className="text-sm text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-[#6b4f45]">Bulk Actions: <button className="ml-3 px-3 py-1 bg-[#f0e6de] rounded">Apply</button></div>
        <div className="text-sm text-gray-500">Showing {products.length} items</div>
      </div>
    </div>
  )
}

export default ProductTable

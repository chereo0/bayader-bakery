import React from 'react'
import { Customer } from './data'

interface Props {
  customers: Customer[]
  onEdit: (id: number) => void
}

const StatusBadge: React.FC<{ status: Customer['status'] }> = ({ status }) => {
  if (status === 'Active') return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Active</span>
  if (status === 'Pending') return <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">Pending</span>
  return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">Inactive</span>
}

const CustomerTable: React.FC<Props> = ({ customers, onEdit }) => {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Total Orders</th>
              <th className="py-2">Total Value</th>
              <th className="py-2">Last Order</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, idx) => (
              <tr key={c.id} className={`border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="py-3 font-medium">{c.name}</td>
                <td className="py-3 text-sm text-[#6b4f45]">{c.email}</td>
                <td className="py-3">{c.totalOrders}</td>
                <td className="py-3">${c.totalValue.toFixed(2)}</td>
                <td className="py-3">{c.lastOrderDate ?? '-'}</td>
                <td className="py-3"><StatusBadge status={c.status} /></td>
                <td className="py-3"><button onClick={()=>onEdit(c.id)} className="bg-[#6b3f2f] text-white px-3 py-1 rounded text-sm">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CustomerTable

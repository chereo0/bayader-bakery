import React, { useState } from 'react'
import { Customer as UserItem } from './data'

interface Props {
  users: UserItem[]
  onEdit: (id: number) => void
}

const StatusBadge: React.FC<{ status: UserItem['status'] }> = ({ status }) => {
  if (status === 'Active') return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Active</span>
  if (status === 'Inactive') return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">Inactive</span>
  return <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">Pending</span>
}

const UserTable: React.FC<Props> = ({ users, onEdit }) => {
  const [selected, setSelected] = useState<number[]>([])

  const toggle = (id: number) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id])

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-500">
              <th className="py-2 pl-2"><input type="checkbox" onChange={(e:any)=> e.target.checked ? setSelected(users.map(u=>u.id)) : setSelected([])} /></th>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Total Orders</th>
              <th className="py-2">Total Order Value</th>
              <th className="py-2">Last Order</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id} className={`border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} hover:bg-neutral-100 transition`}>
                <td className="py-3 pl-2"><input type="checkbox" checked={selected.includes(u.id)} onChange={()=>toggle(u.id)} /></td>
                <td className="py-3 font-medium">{u.name}</td>
                <td className="py-3 text-sm text-[#6b4f45]">{u.email}</td>
                <td className="py-3">{u.totalOrders}</td>
                <td className="py-3">${u.totalValue.toFixed(2)}</td>
                <td className="py-3">{u.lastOrderDate ?? 'N/A'}</td>
                <td className="py-3"><StatusBadge status={u.status} /></td>
                <td className="py-3"><button onClick={()=>onEdit(u.id)} className="px-3 py-1 bg-[#6b3f2f] text-white rounded">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-[#6b4f45]">Bulk Actions: <button className="ml-3 px-3 py-1 bg-[#f0e6de] rounded">Apply</button></div>
        <div className="text-sm text-gray-500">Showing {users.length} customers</div>
      </div>
    </div>
  )
}

export default UserTable

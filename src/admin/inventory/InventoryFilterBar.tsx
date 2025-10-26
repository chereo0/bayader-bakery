import React from 'react'

interface Props {
  search: string
  setSearch: (s: string) => void
  status: string
  setStatus: (s: string) => void
  lowOnly: boolean
  setLowOnly: (b: boolean) => void
  threshold: number
  setThreshold: (n: number) => void
  onApply: () => void
}

const InventoryFilterBar: React.FC<Props> = ({ search, setSearch, status, setStatus, lowOnly, setLowOnly, threshold, setThreshold, onApply }) => {
  return (
    <div className="bg-white p-4 rounded shadow-sm mb-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-xs text-[#6b4f45]">Search</label>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or category..." className="w-full mt-1 border rounded px-3 py-2" />
        </div>

        <div>
          <label className="text-xs text-[#6b4f45]">Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full mt-1 border rounded px-3 py-2">
            <option value="all">All</option>
            <option value="Active">Active</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-[#6b4f45]">Low stock only</label>
          <div className="flex gap-2 items-center mt-1">
            <input type="checkbox" checked={lowOnly} onChange={e=>setLowOnly(e.target.checked)} />
            <input type="number" value={threshold} onChange={e=>setThreshold(Number(e.target.value))} className="border px-3 py-2 rounded w-24" />
            <div className="text-xs text-gray-500">threshold</div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-3">
          <button onClick={onApply} className="bg-[#6b3f2f] text-white px-4 py-2 rounded shadow">Apply</button>
        </div>
      </div>
    </div>
  )
}

export default InventoryFilterBar

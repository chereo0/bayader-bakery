import React from 'react'

interface Props {
  search: string
  setSearch: (v: string) => void
  status: string
  setStatus: (v: string) => void
  onApply: () => void
}

const FilterBar: React.FC<Props> = ({ search, setSearch, status, setStatus, onApply }) => {
  return (
    <div className="bg-white p-4 rounded shadow-sm mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs text-[#6b4f45]">Search</label>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="w-full mt-1 border rounded px-3 py-2" />
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
        <div className="md:col-span-2 flex gap-3 justify-end">
          <button onClick={onApply} className="bg-[#6b3f2f] text-white px-4 py-2 rounded shadow hover:scale-[1.01] transition">Apply Filters</button>
        </div>
      </div>
    </div>
  )
}

export default FilterBar

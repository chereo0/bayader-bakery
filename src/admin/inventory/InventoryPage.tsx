import React, { useMemo, useState } from 'react'
import InventoryFilterBar from './InventoryFilterBar'
import InventoryTable from './InventoryTable'
import StockEditModal from './StockEditModal'
import productsData, { ProductItem } from '../products/data'

const InventoryPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [lowOnly, setLowOnly] = useState(false)
  const [threshold, setThreshold] = useState(10)
  const [products, setProducts] = useState<ProductItem[]>(productsData)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProductItem | null>(null)

  const filtered = useMemo(()=>{
    return products.filter(p=>{
      if (status !== 'all' && p.status !== status) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false
      if (lowOnly && p.stock > threshold) return false
      return true
    })
  }, [products, search, status, lowOnly, threshold])

  const applyFilters = () => { /* filters are live via filtered but keep API */ }

  const openEdit = (p: ProductItem) => { setEditing(p); setModalOpen(true) }
  const openAddStock = (p: ProductItem) => { setEditing(p); setModalOpen(true) }
  const markOut = (p: ProductItem) => {
    if (!confirm(`Mark ${p.name} as out of stock?`)) return
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stock: 0, status: 'Out of Stock' } : x))
  }

  const handleSave = (p: ProductItem) => {
    setProducts(prev => prev.map(x => x.id === p.id ? p : x))
    setModalOpen(false)
    setEditing(null)
  }

  const exportCSV = () => {
    const rows = [['id','name','category','stock','price','status']]
    for (const p of filtered) rows.push([String(p.id), p.name, p.category, String(p.stock), String(p.price), p.status ?? 'Active'])
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#F9F6F2] py-8" style={{ backgroundImage: "url('/images/polka.png')", backgroundRepeat: 'repeat' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display text-[#5E372E]">Inventory Management</h2>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="bg-[#d4ac6f] px-3 py-2 rounded text-white">Export CSV</button>
          </div>
        </div>

        <InventoryFilterBar search={search} setSearch={setSearch} status={status} setStatus={setStatus} lowOnly={lowOnly} setLowOnly={setLowOnly} threshold={threshold} setThreshold={setThreshold} onApply={applyFilters} />

        <InventoryTable products={filtered} onEdit={openEdit} onAddStock={openAddStock} onMarkOut={markOut} />

        <StockEditModal open={modalOpen} product={editing} onSave={handleSave} onClose={()=>{setModalOpen(false); setEditing(null)}} />
      </div>
    </div>
  )
}

export default InventoryPage

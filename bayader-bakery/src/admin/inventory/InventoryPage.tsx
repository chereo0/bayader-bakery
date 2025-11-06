import React, { useMemo, useState, useEffect } from 'react'
import InventoryFilterBar from './InventoryFilterBar'
import InventoryTable from './InventoryTable'
import StockEditModal from './StockEditModal'
import productsData, { ProductItem } from '../products/data'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const InventoryPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [lowOnly, setLowOnly] = useState(false)
  const [threshold, setThreshold] = useState(10)
  const [products, setProducts] = useState<ProductItem[]>(productsData)
  const { token } = useAuth()
  const { show } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) return
        const res = await fetch(`${API_URL}/products?limit=200`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to load products')
        const j = await res.json()
        if (j && j.success && j.data && Array.isArray(j.data.products)) {
          const mapped: ProductItem[] = j.data.products.map((p:any) => ({
            id: p._id,
            name: p.name,
            category: p.category || 'General',
            stock: p.stock || 0,
            price: Number(p.price || 0),
            status: p.status || 'Active'
          }))
          setProducts(mapped)
          return
        }
      } catch (err) {
        console.debug('Load products failed, using local data', err)
      }
      // fallback: keep existing local productsData
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProductItem | null>(null)

  const filtered = useMemo(()=>{
    return products.filter(p=>{
      if (status !== 'all' && p.status !== status) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false
  if (lowOnly && (p.stock ?? 0) > threshold) return false
      return true
    })
  }, [products, search, status, lowOnly, threshold])

  const applyFilters = () => { /* filters are live via filtered but keep API */ }

  const openEdit = (p: ProductItem) => { setEditing(p); setModalOpen(true) }
  const openAddStock = (p: ProductItem) => { setEditing(p); setModalOpen(true) }
  const markOut = (p: ProductItem) => {
    if (!confirm(`Mark ${p.name} as out of stock?`)) return
    const perform = async () => {
      try {
        // set stock to 0
        const res = await fetch(`${API_URL}/products/${p.id}/stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ quantity: 0, operation: 'set' })
        })
        if (!res.ok) throw new Error('Failed to update stock')
        // update status via product update
        const sres = await fetch(`${API_URL}/products/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ status: 'Out of Stock' })
        })
        if (!sres.ok) throw new Error('Failed to update status')
        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stock: 0, status: 'Out of Stock' } : x))
        show && show('Product marked out of stock')
      } catch (err) {
        console.error('Mark out failed, applying locally', err)
        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stock: 0, status: 'Out of Stock' } : x))
        show && show('Marked locally')
      }
    }

    perform()
  }

  const handleSave = (p: ProductItem) => {
    const persist = async () => {
      try {
        // update stock
        const stockRes = await fetch(`${API_URL}/products/${p.id}/stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ quantity: p.stock, operation: 'set' })
        })
        if (!stockRes.ok) throw new Error('Failed to update stock')
        // update status if provided
        const updRes = await fetch(`${API_URL}/products/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ status: p.status })
        })
        if (!updRes.ok) throw new Error('Failed to update product')
        setProducts(prev => prev.map(x => x.id === p.id ? p : x))
        show && show('Product updated')
      } catch (err) {
        console.error('Save stock failed, applying locally', err)
        setProducts(prev => prev.map(x => x.id === p.id ? p : x))
        show && show('Saved locally')
      } finally {
        setModalOpen(false)
        setEditing(null)
      }
    }

    persist()
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

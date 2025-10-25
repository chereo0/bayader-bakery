import React, { useMemo, useState } from 'react'
import AddProductButton from './AddProductButton'
import FilterBar from './FilterBar'
import ProductTable from './ProductTable'
import productsData, { ProductItem } from './data'
import ProductFormModal from './ProductFormModal'

const ProductsManagementPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [products, setProducts] = useState(productsData)

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (status !== 'all' && p.status !== status) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [products, search, status])

  const handleApply = () => {
    // currently filtering is applied live via filtered; this keeps API consistent
  }

  const handleEdit = (id: number) => {
    const p = products.find(x=>x.id === id)
    if (p) {
      setEditingProduct(p)
      setModalOpen(true)
    }
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete product?')) return
    setProducts(p => p.filter(x => x.id !== id))
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)

  const handleSave = (p: ProductItem) => {
    if (products.some(x=>x.id === p.id)) {
      setProducts(prev => prev.map(x=> x.id === p.id ? p : x))
    } else {
      // create
      const nextId = Math.max(0, ...products.map(x=>x.id)) + 1
      setProducts(prev => [{ ...p, id: nextId }, ...prev])
    }
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#F9F6F2] py-8" style={{ backgroundImage: "url('/images/polka.png')", backgroundRepeat: 'repeat' }}>
      <div className="max-w-6xl mx-auto px-4">
        <AddProductButton onClick={handleAddNew} />
        <FilterBar search={search} setSearch={setSearch} status={status} setStatus={setStatus} onApply={handleApply} />
        <ProductTable products={filtered} onEdit={handleEdit} onDelete={handleDelete} />
        <ProductFormModal open={modalOpen} product={editingProduct} onSave={handleSave} onClose={()=>{setModalOpen(false); setEditingProduct(null)}} />
      </div>
    </div>
  )
}

export default ProductsManagementPage

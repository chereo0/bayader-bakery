import React, { useState, useMemo } from 'react'
import { ProductItem } from './data'
import productsData from './data'
import AddProductButton from './AddProductButton'
import FilterBar from './FilterBar'
import ProductTable from './ProductTable'
import ProductFormModal from './ProductFormModal'

const ProductsManagementPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>(productsData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProductItem | null>(null)

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (status !== 'all' && p.status !== status) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [products, search, status])

  const handleApply = () => {
    // Filters are applied live via useMemo, but this keeps the API consistent
  }

  const handleEdit = (id: number) => {
    const product = products.find(p => p.id === id)
    if (product) {
      setEditing(product)
      setModalOpen(true)
    }
  }

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleSave = (product: ProductItem) => {
    if (editing && editing.id) {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p))
    } else {
      setProducts(prev => {
        const newId = prev.length > 0 ? Math.max(...prev.map(p => p.id), 0) + 1 : 1
        return [...prev, { ...product, id: newId }]
      })
    }
    setModalOpen(false)
    setEditing(null)
  }

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#F9F6F2] py-8" style={{ backgroundImage: "url('/images/polka.png')", backgroundRepeat: 'repeat' }}>
      <div className="max-w-6xl mx-auto px-4">
        <AddProductButton onClick={openAdd} />

        <FilterBar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          onApply={handleApply}
        />

        <ProductTable products={filtered} onEdit={handleEdit} onDelete={handleDelete} />

        <ProductFormModal
          open={modalOpen}
          product={editing}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
        />
      </div>
    </div>
  )
}

export default ProductsManagementPage

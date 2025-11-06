import React, { useState, useMemo, useEffect } from 'react'
import { ProductItem } from './data'
import productsData from './data'
import AddProductButton from './AddProductButton'
import FilterBar from './FilterBar'
import ProductTable from './ProductTable'
import ProductFormModal from './ProductFormModal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'

const ProductsManagementPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>(productsData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [applyKey, setApplyKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProductItem | null>(null)
  const { token } = useAuth()
  const { show } = useToast()

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    // Load products from backend for admin with server-side filters & pagination
    const load = async () => {
      setIsLoading(true)
      try {
        const q = new URLSearchParams()
        if (search) q.set('search', search)
        if (status && status !== 'all') q.set('status', status)
        q.set('page', String(page))
        q.set('limit', String(limit))

        const res = await fetch(`${API_URL}/products?${q.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) {
          const txt = await res.text().catch(() => '')
          console.error('Failed to fetch products', txt)
          show && show('Failed to load products')
          setIsLoading(false)
          return
        }
        const data = await res.json()
        if (data && data.success && data.data) {
          const { products: items, pagination } = data.data
          const mapped = items.map((p: any) => ({
            id: p._id,
            name: p.name,
            category: p.category || p.type || '',
            image: Array.isArray(p.images) && p.images.length ? p.images[0] : (p.image || ''),
            description: p.description,
            price: p.price,
            stock: p.stock,
            status: p.status || (p.stock > 0 ? 'Active' : 'Out of Stock'),
            ingredients: p.ingredients,
            reviews: p.reviews,
          }))
          setProducts(mapped)
          setTotalPages(pagination.pages || 1)
          setTotalItems(pagination.total || 0)
        }
      } catch (err) {
        console.error('Error loading products', err)
        show && show('Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }

    // load when token changes or when applyKey/page/limit change
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, applyKey, page, limit])

  const filtered = products

  const handleApply = () => {
    // Trigger server-side fetch with current search/status
    setPage(1)
    setApplyKey(k => k + 1)
  }

  const handleEdit = (id: string | number) => {
    const product = products.find(p => String(p.id) === String(id))
    if (product) {
      setEditing(product)
      setModalOpen(true)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to delete product')
        return
      }
      setProducts(prev => prev.filter(p => p.id !== id))
      show && show('Product deleted')
    } catch (err) {
      console.error('Delete product failed', err)
      show && show('Delete failed')
    }
  }

  const handleSave = async (product: ProductItem) => {
    try {
      // If editing, update existing product
      if (editing && editing.id) {
        const res = await fetch(`${API_URL}/products/${editing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description,
            stock: product.stock,
            images: product.image ? [product.image] : [],
            status: product.status,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          alert(err.message || 'Failed to update product')
          return
        }
        const data = await res.json().catch(() => null)
        // Update locally
        setProducts(prev => prev.map(p => (p.id === editing.id ? { ...p, ...product } : p)))
      } else {
        // Create new product
        const res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description,
            stock: product.stock,
            images: product.image ? [product.image] : [],
            status: product.status,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          alert(err.message || 'Failed to create product')
          return
        }
        const resp = await res.json().catch(() => null)
        const created = resp && resp.data ? resp.data : null
        const newItem: ProductItem = {
          id: created?._id || `${Date.now()}`,
          name: product.name,
          category: product.category,
          image: product.image,
          description: product.description,
          price: product.price,
          stock: product.stock,
          status: product.status,
        }
        setProducts(prev => [...prev, newItem])
      }
      setModalOpen(false)
      setEditing(null)
      show && show(editing ? 'Product updated' : 'Product created')
    } catch (err) {
      console.error('Save product failed', err)
      show && show('Save failed')
    }
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

        <div className="relative">
          <ProductTable products={filtered} onEdit={handleEdit} onDelete={handleDelete} />

          {isLoading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <div className="loader border-t-4 border-b-4 border-[#6b3f2f] w-8 h-8 rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing page {page} of {totalPages} — {totalItems} items</div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
            <select value={limit} onChange={e=>{ setLimit(Number(e.target.value)); setPage(1); }} className="border px-2 py-1 rounded">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

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

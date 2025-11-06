import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { ProductItem } from './data'

interface Props {
  open: boolean
  product?: ProductItem | null
  onSave: (p: ProductItem) => void
  onClose: () => void
}

const ProductFormModal: React.FC<Props> = ({ open, product, onSave, onClose }) => {
  const getDefaultForm = (): ProductItem => ({
    id: 0,
    name: '',
    category: '',
    image: '',
    price: 0,
    stock: 0,
    status: 'Active'
  })

  const [form, setForm] = useState<ProductItem>(product ? { ...product } : getDefaultForm())
  const { token } = useAuth()
  const { show } = useToast()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(product ? { ...product } : getDefaultForm())
    }
  }, [product, open])

  if (!open) return null

  const handleChange = (k: keyof ProductItem, v: any) => {
    setForm({ ...form, [k]: typeof form[k] === 'number' ? Number(v) : v } as ProductItem)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  const handleFile = async (file?: File) => {
    if (!file) return
    setUploading(true)
    show && show('Uploading image...')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`${API_URL}/products/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        show && show(err.message || 'Upload failed')
        setUploading(false)
        return
      }
      const data = await res.json().catch(() => null)
      const url = data && data.data ? data.data.url : null
      if (url) {
        setForm(f => ({ ...f, image: url }))
        show && show('Image uploaded')
      }
    } catch (err) {
      console.error('Upload failed', err)
      show && show('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium text-[#5E372E] mb-4">{product ? 'Edit Product' : 'Add Product'}</h3>

        <div className="grid grid-cols-1 gap-3">
          <label className="text-sm">Name</label>
          <input required value={form.name} onChange={e=>handleChange('name', e.target.value)} className="border px-3 py-2 rounded" />

          <label className="text-sm">Category</label>
          <input required value={form.category} onChange={e=>handleChange('category', e.target.value)} className="border px-3 py-2 rounded" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Stock</label>
              <input required type="number" value={form.stock ?? 0} onChange={e=>handleChange('stock', e.target.value)} className="border px-3 py-2 rounded w-full" />
            </div>
            <div>
              <label className="text-sm">Price</label>
              <input required type="number" step="0.01" value={form.price} onChange={e=>handleChange('price', e.target.value)} className="border px-3 py-2 rounded w-full" />
            </div>
          </div>

          <label className="text-sm">Status</label>
          <select value={form.status ?? 'Active'} onChange={e=>handleChange('status', e.target.value as any)} className="border px-3 py-2 rounded">
            <option value="Active">Active</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Draft">Draft</option>
          </select>

          <label className="text-sm">Image URL</label>
          <div className="flex gap-2 items-center">
            <input value={form.image ?? ''} onChange={e=>handleChange('image', e.target.value)} className="border px-3 py-2 rounded flex-1" />
            <input type="file" accept="image/*" onChange={e=>handleFile(e.target.files?.[0])} className="ml-2" />
          </div>
          {uploading && <div className="text-sm text-gray-500 mt-1">Uploading...</div>}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-[#6b3f2f] text-white rounded">Save</button>
        </div>
      </form>
    </div>
  )
}

export default ProductFormModal

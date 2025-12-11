import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { ProductItem, RecipeItem } from './data'
import RecipeManager from './RecipeManager'

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
    status: 'Active',
    recipe: []
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
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-[#5E372E] mb-4">{product ? 'Edit Product' : 'Add Product'}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input required title="Product Name" placeholder="Enter product name" value={form.name} onChange={e=>handleChange('name', e.target.value)} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]" />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select required title="Product Category" value={form.category} onChange={e=>handleChange('category', e.target.value)} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]">
              <option value="">Select Category</option>
              <option value="Cakes">Cakes</option>
              <option value="Pastries">Pastries</option>
              <option value="Breads">Breads</option>
              <option value="Cookies">Cookies</option>
              <option value="Custom Orders">Custom Orders</option>
              <option value="Seasonal">Seasonal</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Stock</label>
            <input required type="number" min="0" title="Stock Quantity" placeholder="0" value={form.stock ?? 0} onChange={e=>handleChange('stock', e.target.value)} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]" />
          </div>

          <div>
            <label className="text-sm font-medium">Price ($)</label>
            <input required type="number" min="0" step="0.01" title="Product Price" placeholder="0.00" value={form.price} onChange={e=>handleChange('price', e.target.value)} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]" />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select title="Product Status" value={form.status ?? 'Active'} onChange={e=>handleChange('status', e.target.value as any)} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]">
              <option value="Active">Active</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Image URL</label>
            <div className="flex gap-2 items-center">
              <input value={form.image ?? ''} onChange={e=>handleChange('image', e.target.value)} className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]" placeholder="Enter image URL" />
              <input type="file" accept="image/*" title="Upload Product Image" onChange={e=>handleFile(e.target.files?.[0])} className="text-sm" />
            </div>
            {uploading && <div className="text-sm text-gray-500 mt-1">Uploading...</div>}
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              value={form.description ?? ''} 
              onChange={e=>handleChange('description', e.target.value)} 
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]" 
              rows={2}
              placeholder="Product description"
            />
          </div>

          <div className="md:col-span-2">
            <RecipeManager 
              recipe={form.recipe || []} 
              onChange={(recipe: RecipeItem[]) => handleChange('recipe', recipe)}
            />
          </div>
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

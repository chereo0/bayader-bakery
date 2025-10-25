import React, { useEffect, useState } from 'react'
import { ProductItem } from './data'

interface Props {
  open: boolean
  product?: ProductItem | null
  onSave: (p: ProductItem) => void
  onClose: () => void
}

const ProductFormModal: React.FC<Props> = ({ open, product, onSave, onClose }) => {
  const [form, setForm] = useState<ProductItem | null>(product ?? null)

  useEffect(() => {
    setForm(product ? { ...product } : null)
  }, [product])

  if (!open) return null

  const handleChange = (k: keyof ProductItem, v: any) => {
    if (!form) return
    setForm({ ...form, [k]: typeof form[k] === 'number' ? Number(v) : v } as ProductItem)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium text-[#5E372E] mb-4">{product ? 'Edit Product' : 'Add Product'}</h3>

        <div className="grid grid-cols-1 gap-3">
          <label className="text-sm">Name</label>
          <input required value={form?.name ?? ''} onChange={e=>handleChange('name', e.target.value)} className="border px-3 py-2 rounded" />

          <label className="text-sm">Category</label>
          <input required value={form?.category ?? ''} onChange={e=>handleChange('category', e.target.value)} className="border px-3 py-2 rounded" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Stock</label>
              <input required type="number" value={form?.stock ?? 0} onChange={e=>handleChange('stock', e.target.value)} className="border px-3 py-2 rounded w-full" />
            </div>
            <div>
              <label className="text-sm">Price</label>
              <input required type="number" step="0.01" value={form?.price ?? 0} onChange={e=>handleChange('price', e.target.value)} className="border px-3 py-2 rounded w-full" />
            </div>
          </div>

          <label className="text-sm">Status</label>
          <select value={form?.status ?? 'Active'} onChange={e=>handleChange('status', e.target.value as any)} className="border px-3 py-2 rounded">
            <option value="Active">Active</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Draft">Draft</option>
          </select>

          <label className="text-sm">Image URL</label>
          <input value={form?.image ?? ''} onChange={e=>handleChange('image', e.target.value)} className="border px-3 py-2 rounded" />
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

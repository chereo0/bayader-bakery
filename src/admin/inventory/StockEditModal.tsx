import React, { useEffect, useState } from 'react'
import { ProductItem } from '../products/data'

interface Props {
  open: boolean
  product?: ProductItem | null
  onSave: (p: ProductItem) => void
  onClose: () => void
}

const StockEditModal: React.FC<Props> = ({ open, product, onSave, onClose }) => {
  const [stock, setStock] = useState<number>(0)
  const [status, setStatus] = useState<ProductItem['status'] | undefined>(undefined)

  useEffect(()=>{
    if (product) {
      setStock(product.stock)
      setStatus(product.status)
    }
  }, [product])

  if (!open || !product) return null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...product, stock, status })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-medium text-[#5E372E] mb-4">Edit Stock — {product.name}</h3>

        <div className="grid gap-3">
          <label className="text-sm">Stock</label>
          <input type="number" className="border px-3 py-2 rounded" value={stock} onChange={e=>setStock(Number(e.target.value))} />

          <label className="text-sm">Status</label>
          <select className="border px-3 py-2 rounded" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option value="Active">Active</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-[#6b3f2f] text-white rounded">Save</button>
        </div>
      </form>
    </div>
  )
}

export default StockEditModal

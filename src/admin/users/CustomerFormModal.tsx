import React, { useEffect, useState } from 'react'
import { Customer } from './data'

interface Props {
  open: boolean
  customer?: Customer | null
  onSave: (c: Customer) => void
  onClose: () => void
}

const CustomerFormModal: React.FC<Props> = ({ open, customer, onSave, onClose }) => {
  const [form, setForm] = useState<Customer | null>(customer ?? null)

  useEffect(()=>{
    setForm(customer ? { ...customer } : { id: 0, name: '', email: '', phone: '', totalOrders: 0, totalValue: 0, lastOrderDate: undefined, status: 'Active' })
  }, [customer])

  if (!open || !form) return null

  const change = (k: keyof Customer, v: any) => setForm({...form, [k]: typeof form[k] === 'number' ? Number(v) : v } as Customer)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-[#5E372E] mb-4">{customer ? 'Edit Customer' : 'Add Customer'}</h3>

        <div className="grid grid-cols-1 gap-3">
          <label className="text-sm">Name</label>
          <input required value={form.name} onChange={e=>change('name', e.target.value)} className="border px-3 py-2 rounded" />

          <label className="text-sm">Email</label>
          <input required value={form.email} onChange={e=>change('email', e.target.value)} className="border px-3 py-2 rounded" />

          <label className="text-sm">Phone</label>
          <input value={form.phone} onChange={e=>change('phone', e.target.value)} className="border px-3 py-2 rounded" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Total Orders</label>
              <input type="number" value={form.totalOrders} onChange={e=>change('totalOrders', e.target.value)} className="border px-3 py-2 rounded w-full" />
            </div>
            <div>
              <label className="text-sm">Total Value</label>
              <input type="number" step="0.01" value={form.totalValue} onChange={e=>change('totalValue', e.target.value)} className="border px-3 py-2 rounded w-full" />
            </div>
          </div>

          <label className="text-sm">Status</label>
          <select value={form.status} onChange={e=>change('status', e.target.value as any)} className="border px-3 py-2 rounded">
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
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

export default CustomerFormModal

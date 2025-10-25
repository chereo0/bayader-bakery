import React, { useMemo, useState } from 'react'
import AddCustomerButton from './AddCustomerButton'
import FilterBar from './FilterBar'
import CustomerTable from './CustomerTable'
import usersData, { Customer } from './data'
import CustomerFormModal from './CustomerFormModal'

const UsersManagementPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [customers, setCustomers] = useState<Customer[]>(usersData)

  const filtered = useMemo(() => {
    return customers.filter(c => {
      if (status !== 'all' && c.status !== status) return false
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [customers, search, status])

  const handleApply = () => {
    // filters apply via filtered
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const handleEdit = (id: number) => {
    const c = customers.find(x=>x.id === id)
    if (c) {
      setEditingCustomer(c)
      setModalOpen(true)
    }
  }

  const handleAddNew = () => {
    setEditingCustomer(null)
    setModalOpen(true)
  }

  const handleSave = (c: Customer) => {
    if (customers.some(x=>x.id === c.id)) {
      setCustomers(prev => prev.map(x=> x.id === c.id ? c : x))
    } else {
      const nextId = Math.max(0, ...customers.map(x=>x.id)) + 1
      setCustomers(prev => [{ ...c, id: nextId }, ...prev])
    }
    setModalOpen(false)
    setEditingCustomer(null)
  }

  return (
    <div className="min-h-screen bg-[#F9F6F2] py-8" style={{ backgroundImage: "url('/images/polka.png')", backgroundRepeat: 'repeat' }}>
      <div className="max-w-6xl mx-auto px-4">
        <AddCustomerButton onClick={handleAddNew} />
        <FilterBar query={search} setQuery={setSearch} status={status} setStatus={setStatus} onApply={handleApply} />
        <CustomerTable customers={filtered} onEdit={handleEdit} />
        <CustomerFormModal open={modalOpen} customer={editingCustomer} onSave={handleSave} onClose={()=>{setModalOpen(false); setEditingCustomer(null)}} />
      </div>
    </div>
  )
}

export default UsersManagementPage

import React, { useState, useMemo } from 'react'
import { Customer } from './data'
import usersData from './data'
import FilterBar from './FilterBar'
import UserTable from './UserTable'
import AddCustomerButton from './AddCustomerButton'
import CustomerFormModal from './CustomerFormModal'

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<Customer[]>(usersData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (status !== 'all' && u.status !== status) return false
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [users, search, status])

  const handleApply = () => {
    // Filters are applied live via useMemo, but this keeps the API consistent
  }

  const handleEdit = (id: number) => {
    const user = users.find(u => u.id === id)
    if (user) {
      setEditing(user)
      setModalOpen(true)
    }
  }

  const handleSave = (customer: Customer) => {
    if (editing && editing.id) {
      setUsers(prev => prev.map(u => u.id === customer.id ? customer : u))
    } else {
      setUsers(prev => {
        const newId = prev.length > 0 ? Math.max(...prev.map(u => u.id), 0) + 1 : 1
        return [...prev, { ...customer, id: newId }]
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
        <AddCustomerButton onClick={openAdd} />

        <FilterBar
          query={search}
          setQuery={setSearch}
          status={status}
          setStatus={setStatus}
          onApply={handleApply}
        />

        <UserTable users={filtered} onEdit={handleEdit} />

        <CustomerFormModal
          open={modalOpen}
          customer={editing}
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

export default UsersManagementPage

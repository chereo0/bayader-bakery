import React, { useState, useMemo, useEffect } from 'react'
import { Customer } from './data'
import usersData from './data'
import FilterBar from './FilterBar'
import UserTable from './UserTable'
import AddCustomerButton from './AddCustomerButton'
import CustomerFormModal from './CustomerFormModal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import ConfirmModal from '../../components/ui/ConfirmModal'

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<Customer[]>(usersData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [applyKey, setApplyKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const { token } = useAuth()
  const { show } = useToast()

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const q = new URLSearchParams()
        if (search) q.set('search', search)
        if (status && status !== 'all') q.set('status', status)
        q.set('page', String(page))
        q.set('limit', String(limit))

        const res = await fetch(`${API_URL}/users?${q.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        if (!res.ok) {
          const txt = await res.text().catch(() => '')
          console.error('Failed to fetch users', txt)
          show && show('Failed to load users')
          setIsLoading(false)
          return
        }

        const data = await res.json()
        if (data && data.success && data.data) {
          const items = data.data
          const mapped = items.map((u: any) => ({
            id: u._id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            totalOrders: (u.totalOrders) || 0,
            totalValue: (u.totalValue) || 0,
            lastOrderDate: u.lastOrderDate || undefined,
            status: u.role === 'customer' ? 'Active' : 'Active',
          }))
          setUsers(mapped)
          // server returns meta in meta or pagination
          setTotalPages(data.meta?.pages || 1)
          setTotalItems(data.meta?.total || 0)
        }
      } catch (err) {
        console.error('Error loading users', err)
        show && show('Failed to load users')
      } finally {
        setIsLoading(false)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, applyKey, page, limit])

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (status !== 'all' && u.status !== status) return false
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [users, search, status])

  const handleApply = () => {
    // Filters are applied live via useMemo, but this keeps the API consistent
    setPage(1)
    setApplyKey(k => k + 1)
  }

  const handleEdit = (id: string | number) => {
    const user = users.find(u => String(u.id) === String(id))
    if (user) {
      setEditing(user)
      setModalOpen(true)
    }
  }
  // Confirmation modal state for deletes
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingIds, setPendingIds] = useState<Array<string | number>>([])
  const [confirmLoading, setConfirmLoading] = useState(false)

  // Open confirmation for single delete
  const handleDelete = (id: string | number) => {
    setPendingIds([id])
    setConfirmOpen(true)
  }

  // Open confirmation for bulk delete
  const handleBulkDelete = (ids: Array<string | number>) => {
    if (!ids || ids.length === 0) return
    setPendingIds(ids)
    setConfirmOpen(true)
  }

  // perform delete for one or many ids (called after confirmation)
  const performDeleteIds = async (ids: Array<string | number>) => {
    if (!ids || ids.length === 0) return
    try {
      setConfirmLoading(true)
      setIsLoading(true)

      // Use backend bulk-delete endpoint (DELETE /api/users with JSON body) if available
      const res = await fetch(`${API_URL}/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids })
      })

      if (!res.ok) {
        // fallback: try per-id deletes if bulk endpoint not supported
        const text = await res.text().catch(()=>'')
        console.warn('Bulk delete failed, falling back to individual deletes', text)
        const ops = ids.map(id => fetch(`${API_URL}/users/${id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }))
        const results = await Promise.all(ops)
        const failed = [] as number[]
        results.forEach((r, idx) => { if (!r.ok) failed.push(idx) })
        const succeeded = ids.filter((_, idx) => !failed.includes(idx))
        setUsers(prev => prev.filter(u => !succeeded.some(sid => String(sid) === String(u.id))))
        show && show(`Deleted ${succeeded.length} users${failed.length ? `, ${failed.length} failed` : ''}`)
        return
      }

      const j = await res.json().catch(()=>null)
      const deleted = (j && (j.deletedCount || j.deleted || j.successCount)) || 0
      // remove deleted ids from UI; assume backend deleted the given ids
      setUsers(prev => prev.filter(u => !ids.some(id => String(id) === String(u.id))))
      show && show(`Deleted ${deleted} users`)
    } catch (err) {
      console.error('Delete failed', err)
      show && show('Delete failed')
    } finally {
      setConfirmLoading(false)
      setIsLoading(false)
      setConfirmOpen(false)
      setPendingIds([])
    }
  }

  const handleSave = (customer: Customer) => {
    // Persist changes to backend
    const save = async () => {
      try {
        if (editing && editing.id) {
          const res = await fetch(`${API_URL}/users/${editing.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ name: customer.name, email: customer.email, phone: customer.phone })
          })
          if (!res.ok) {
            const err = await res.json().catch(()=>({}))
            alert(err.message || 'Failed to update user')
            return
          }
          setUsers(prev => prev.map(u => String(u.id) === String(editing.id) ? { ...u, ...customer } : u))
          show && show('User updated')
        } else {
          // Create
          const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ name: customer.name, email: customer.email, phone: customer.phone, password: (customer as any).password || 'changeme' })
          })
          if (!res.ok) {
            const err = await res.json().catch(()=>({}))
            alert(err.message || 'Failed to create user')
            return
          }
          const resp = await res.json().catch(()=>null)
          const created = resp && resp.data ? resp.data : null
          const newItem: Customer = {
            id: created?._id || `${Date.now()}`,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            totalOrders: 0,
            totalValue: 0,
            lastOrderDate: undefined,
            status: 'Active'
          }
          setUsers(prev => [...prev, newItem])
          show && show('User created')
        }
      } catch (err) {
        console.error('Save user failed', err)
        show && show('Save failed')
      }
    }

    save()
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

        <UserTable users={filtered} onEdit={handleEdit} onDelete={handleDelete} onBulkDelete={handleBulkDelete} isLoading={isLoading} />

        <ConfirmModal
          open={confirmOpen}
          title={pendingIds.length > 1 ? `Delete ${pendingIds.length} users?` : 'Delete user?'}
          message={pendingIds.length > 1 ? `Are you sure you want to delete ${pendingIds.length} users? This action cannot be undone.` : 'Are you sure you want to delete this user? This action cannot be undone.'}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => performDeleteIds(pendingIds)}
          onCancel={() => { setConfirmOpen(false); setPendingIds([]) }}
          loading={confirmLoading}
        />

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

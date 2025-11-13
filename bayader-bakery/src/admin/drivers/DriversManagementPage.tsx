import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

interface Driver {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  role: string
  department: string
  createdAt: string
}

interface FormData {
  name: string
  email: string
  password: string
  phone: string
  address: string
}

const API_BASE_URL = 'http://localhost:5000/api'

const DriversManagementPage: React.FC = () => {
  const { token } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  })

  // Fetch drivers
  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/drivers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch drivers')

      const result = await response.json()
      setDrivers(result.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        setError('Please fill in all required fields')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }

      const url = editingId
        ? `${API_BASE_URL}/admin/drivers/${editingId}`
        : `${API_BASE_URL}/admin/drivers`

      const method = editingId ? 'PUT' : 'POST'

      const body = editingId
        ? {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: formData.email
          }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save driver')
      }

      setSuccess(editingId ? 'Driver updated successfully!' : 'Driver created successfully!')
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: ''
      })
      setEditingId(null)
      setShowForm(false)

      // Refresh drivers list
      setTimeout(() => fetchDrivers(), 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to save driver')
    }
  }

  const handleEdit = (driver: Driver) => {
    setFormData({
      name: driver.name,
      email: driver.email,
      password: '', // Password not shown in edit
      phone: driver.phone,
      address: driver.address
    })
    setEditingId(driver._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/drivers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete driver')

      setSuccess('Driver deleted successfully!')
      fetchDrivers()
    } catch (err: any) {
      setError(err.message || 'Failed to delete driver')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: ''
    })
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#5E372E]">Drivers Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#5E372E] text-white px-6 py-2 rounded-md hover:bg-[#6b453f] transition-colors font-medium"
        >
          {showForm ? 'Cancel' : '+ Add New Driver'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#5E372E] mb-4">
            {editingId ? 'Edit Driver' : 'Create New Driver'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter driver name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                required
                disabled={editingId !== null}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editingId ? '(optional)' : '*'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password (min 6 characters)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                required={!editingId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#5E372E] text-white px-4 py-2 rounded-md hover:bg-[#6b453f] transition-colors font-medium"
              >
                {editingId ? 'Update Driver' : 'Create Driver'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drivers List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#5E372E]">
            All Drivers ({drivers.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E372E]"></div>
            <p className="mt-2 text-gray-600">Loading drivers...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No drivers found. Create your first driver!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {drivers.map(driver => (
                  <tr key={driver._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{driver.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{driver.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{driver.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{driver.address || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(driver.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(driver)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(driver._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DriversManagementPage

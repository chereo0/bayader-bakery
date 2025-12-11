import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AdminEventEditPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    time: '',
    venue: '',
    price: '',
    perPersonPrice: '',
    image: '',
    isActive: true,
    theme: [] as string[]
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return
      
      try {
        setFetching(true)
        const response = await axios.get(`${API_BASE_URL}/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.data.success) {
          const event = response.data.data
          
          // Convert dates to datetime-local format
          const startDate = event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : ''
          const endDate = event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ''
          
          setFormData({
            title: event.title || '',
            description: event.description || '',
            startDate,
            endDate,
            time: event.time || '',
            venue: event.venue || '',
            price: event.price || '',
            perPersonPrice: event.perPersonPrice ? event.perPersonPrice.toString() : '',
            image: event.image || '',
            isActive: event.isActive !== false,
            theme: event.theme || []
          })
        }
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to load event'
        setError(message)
        console.error('Error fetching event:', err)
      } finally {
        setFetching(false)
      }
    }

    fetchEvent()
  }, [id, token])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date'
    }
    if (formData.perPersonPrice && isNaN(parseFloat(formData.perPersonPrice))) {
      newErrors.perPersonPrice = 'Price must be a valid number'
    }
    if (formData.perPersonPrice && parseFloat(formData.perPersonPrice) < 0) {
      newErrors.perPersonPrice = 'Price must be non-negative'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.currentTarget
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.currentTarget as HTMLInputElement).checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      addToast('Please fix the errors below', 'error')
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        time: formData.time,
        venue: formData.venue,
        price: formData.price,
        perPersonPrice: formData.perPersonPrice ? parseFloat(formData.perPersonPrice) : null,
        image: formData.image,
        isActive: formData.isActive,
        theme: formData.theme
      }

      const response = await axios.put(`${API_BASE_URL}/events/${id}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        addToast('Event updated successfully', 'success')
        setTimeout(() => {
          navigate('/admin/events')
        }, 1000)
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update event'
      addToast(message, 'error')
      console.error('Error updating event:', err)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c79a63]"></div>
        <p className="text-gray-600 mt-4">Loading event...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
        <button
          onClick={() => navigate('/admin/events')}
          className="mt-4 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back to Events
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#5E372E]">Edit Event</h1>
        <p className="text-gray-600 mt-2">Update event details and pricing</p>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c79a63] ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter event description"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c79a63]"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
          <input
            type="datetime-local"
            name="startDate"
            title="Start Date"
            placeholder="Select start date and time"
            value={formData.startDate}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c79a63] ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
          <input
            type="datetime-local"
            name="endDate"
            title="End Date"
            placeholder="Select end date and time"
            value={formData.endDate}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c79a63] ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>

        {/* Venue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="Enter event venue"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c79a63]"
          />
        </div>

        {/* Price Per Person (Main Pricing Field) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Per Person 💰
          </label>
          <p className="text-xs text-gray-600 mb-2">This is the main pricing field shown to customers</p>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-gray-700 font-medium">$</span>
            <input
              type="number"
              name="perPersonPrice"
              title="Price Per Person"
              placeholder="0.00"
              value={formData.perPersonPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c79a63] ${
                errors.perPersonPrice ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.perPersonPrice && <p className="mt-1 text-sm text-red-600">{errors.perPersonPrice}</p>}
          <p className="mt-2 text-xs text-gray-600">Leave blank if pricing is to be determined</p>
        </div>

        {/* Legacy Price Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (Legacy)</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 'Early bird discount' or custom text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c79a63]"
          />
          <p className="text-xs text-gray-600 mt-1">Optional: For promotional text or special pricing details</p>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Enter image URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c79a63]"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            title="Active Status"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-[#c79a63] rounded focus:ring-[#c79a63]"
          />
          <label className="ml-3 text-sm font-medium text-gray-700">Active (visible to customers)</label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin/events')}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b88a52] transition-colors font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminEventEditPage

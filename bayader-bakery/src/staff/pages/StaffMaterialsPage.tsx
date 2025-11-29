import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface Material {
  _id: string
  name: string
  currentStock: number
  reorderLevel: number
  unit: string
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('token')

const StaffMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [reportingMaterialId, setReportingMaterialId] = useState<string | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

  useEffect(() => {
    fetchMaterials()
  }, [])

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const token = getToken()
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await axios.get(`${API_BASE_URL}/materials`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        // Backend returns { success: true, data: { materials: [...], pagination: {...} } }
        const materialsData = response.data.data?.materials
        const materialsArray = Array.isArray(materialsData) ? materialsData : []
        setMaterials(materialsArray)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials')
      console.error('Error fetching materials:', err)
      setMaterials([]) // Ensure materials is always an array even on error
    } finally {
      setLoading(false)
    }
  }

  const isLowStock = (material: Material): boolean => {
    return material.currentStock <= material.reorderLevel
  }

  const openReportDialog = (material: Material) => {
    setSelectedMaterial(material)
    setShowReportDialog(true)
  }

  const closeReportDialog = () => {
    setShowReportDialog(false)
    setSelectedMaterial(null)
  }

  const handleReportShortage = async () => {
    if (!selectedMaterial) return

    try {
      setReportingMaterialId(selectedMaterial._id)
      const token = getToken()

      // First, fetch the admin user to get their ID
      const adminResponse = await axios.get(`${API_BASE_URL}/users?role=admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const admins = adminResponse.data.data || []
      if (admins.length === 0) {
        addToast('No admin found to send report to', 'error')
        setReportingMaterialId(null)
        return
      }

      const adminId = admins[0]._id

      // Send message to the admin
      const response = await axios.post(
        `${API_BASE_URL}/messages`,
        {
          to: adminId,
          subject: 'Stock Shortage Alert',
          message: `Stock shortage reported for material: ${selectedMaterial.name}\n\nCurrent Stock: ${selectedMaterial.currentStock} ${selectedMaterial.unit}\nReorder Level: ${selectedMaterial.reorderLevel} ${selectedMaterial.unit}`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        addToast(`Stock shortage report sent for ${selectedMaterial.name}`, 'success')
        closeReportDialog()
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send report'
      addToast(errorMessage, 'error')
      console.error('Error reporting shortage:', err)
    } finally {
      setReportingMaterialId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#5E372E]">Materials & Inventory</h1>
          <p className="text-gray-600 mt-2">Monitor material stock levels and report shortages</p>
        </div>
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c79a63]"></div>
          <p className="text-gray-600 mt-4">Loading materials...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#c79a63]">
              <p className="text-gray-600 text-sm font-medium">Total Materials</p>
              <p className="text-3xl font-bold text-[#5E372E] mt-2">{materials.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <p className="text-gray-600 text-sm font-medium">Good Stock</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {materials.filter(m => !isLowStock(m)).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
              <p className="text-gray-600 text-sm font-medium">Low Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {materials.filter(m => isLowStock(m)).length}
              </p>
            </div>
          </div>

          {/* Materials Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {materials.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 text-lg">No materials found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Material Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Reorder Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {materials.map((material) => {
                      const lowStock = isLowStock(material)
                      
                      return (
                        <tr key={material._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-[#5E372E]">
                            {material.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                            {material.currentStock}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {material.reorderLevel}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {material.unit}
                          </td>
                          <td className="px-6 py-4">
                            {lowStock ? (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                Good
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {lowStock ? (
                              <button
                                onClick={() => openReportDialog(material)}
                                disabled={reportingMaterialId === material._id}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-xs"
                              >
                                {reportingMaterialId === material._id ? '📧 Reporting...' : '⚠️ Report Shortage'}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Report Shortage Dialog */}
      {showReportDialog && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-[#5E372E] mb-4">Report Stock Shortage</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Material</p>
                <p className="text-lg font-semibold text-[#5E372E]">{selectedMaterial.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className="text-xl font-semibold text-red-600">
                    {selectedMaterial.currentStock} {selectedMaterial.unit}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Reorder Level</p>
                  <p className="text-xl font-semibold text-gray-700">
                    {selectedMaterial.reorderLevel} {selectedMaterial.unit}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will send a notification to the admin about the stock shortage.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeReportDialog}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReportShortage}
                disabled={reportingMaterialId === selectedMaterial._id}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium transition-colors"
              >
                {reportingMaterialId === selectedMaterial._id ? 'Sending...' : 'Send Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffMaterialsPage

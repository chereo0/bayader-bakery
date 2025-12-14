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
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      show && show('Please select an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      show && show('Image size must be less than 5MB')
      return
    }
    
    setUploading(true)
    show && show('Uploading image...')
    
    try {
      const fd = new FormData()
      fd.append('image', file)
      
      console.log('📤 Uploading to:', `${API_URL}/products/upload`)
      console.log('📤 File:', file.name, file.type, file.size)
      
      const res = await fetch(`${API_URL}/products/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
      })
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('❌ Upload error:', err)
        show && show(err.message || 'Upload failed')
        setUploading(false)
        return
      }
      
      const data = await res.json().catch(() => null)
      console.log('✅ Upload response:', data)
      
      const url = data?.data?.url
      
      if (!url) {
        console.error('❌ No URL in response:', data)
        show && show('Upload succeeded but no URL returned')
        setUploading(false)
        return
      }
      
      // Validate URL format
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.error('❌ Invalid URL format:', url)
        show && show('Invalid image URL received')
        setUploading(false)
        return
      }
      
      console.log('✅ Setting image URL:', url)
      setForm(f => ({ ...f, image: url }))
      show && show('✅ Image uploaded successfully')
      
    } catch (err) {
      console.error('❌ Upload exception:', err)
      show && show('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
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

          <div className="md:col-span-2">
            <label className="text-sm font-medium block mb-2">Product Image</label>
            
            {/* Current Image Preview */}
            {form.image && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">Current Image:</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={form.image} 
                    alt="Product preview" 
                    className="w-24 h-24 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, image: '' }))}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}

            {/* Upload or Paste URL */}
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-700">Upload New Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  title="Upload Product Image" 
                  onChange={e=>handleFile(e.target.files?.[0])} 
                  className="w-full text-sm border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]" 
                  disabled={uploading}
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-700">Or Paste Image URL</label>
                <input 
                  value={form.image ?? ''} 
                  onChange={e=>handleChange('image', e.target.value)} 
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]" 
                  placeholder="https://res.cloudinary.com/..." 
                  disabled={uploading}
                />
              </div>
              
              {uploading && (
                <div className="text-sm text-blue-600 flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading image...
                </div>
              )}
            </div>
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
            <label className="text-sm font-medium block mb-2">Ingredients (Optional, comma-separated)</label>
            <input 
              type="text"
              value={Array.isArray(form.ingredients) ? form.ingredients.join(', ') : ''} 
              onChange={e=>{
                const val = e.target.value;
                const arr = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
                handleChange('ingredients', arr);
              }}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]"
              placeholder="flour, sugar, eggs, butter"
            />
            <p className="text-xs text-gray-500 mt-1">Enter ingredients separated by commas</p>
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

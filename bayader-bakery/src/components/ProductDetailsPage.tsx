import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productApi } from '../utils/api'

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { addItem, showToast } = useCart()
  const { isAuthenticated, user } = useAuth()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [hoveredStar, setHoveredStar] = useState(0)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        console.log('🔍 Fetching product:', id)
        const result = await productApi.getProductById(id)
        console.log('📦 Product API result:', result)
        
        if (!result) {
          setError('No response from server')
          console.error('❌ API returned null/undefined')
          return
        }
        
        if (result.success && result.data) {
          const productData = {
            ...result.data,
            // Ensure price is a number
            price: typeof result.data.price === 'number' ? result.data.price : parseFloat(result.data.price) || 0,
            // Use image field, or first item from images array, or fallback
            image: (result.data.image && result.data.image !== '/images/placeholder.jpg') 
              ? result.data.image 
              : (result.data.images && result.data.images.length > 0 ? result.data.images[0] : '/images/products.jpg')
          }
          console.log('✅ Product data processed:', productData)
          setProduct(productData)
          if (result.data.reviews && Array.isArray(result.data.reviews)) {
            setReviews(result.data.reviews)
          }
        } else {
          setError(result.error || result.message || 'Failed to load product')
          console.error('❌ API returned error:', result.error || result.message)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error('❌ Error fetching product:', errorMsg, error)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#6b3f2f] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#5E372E]">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#6b3f2f] text-white px-6 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <div className="text-center">
          <p className="text-[#5E372E] mb-4">Product not found.</p>
          <a href="/products" className="bg-[#6b3f2f] text-white px-6 py-2 rounded inline-block">
            Back to Products
          </a>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem({ id: String(product._id), name: product.name, price: product.price, image: product.image })
    showToast(`${product.name} added to cart!`)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      alert('Please log in to submit a review')
      return
    }

    if (!comment.trim()) {
      alert('Please write a comment')
      return
    }

    setIsSubmittingReview(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/${id}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            rating,
            comment: comment.trim()
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit review')
      }

      const result = await response.json()
      
      // Add the new review to the list
      const newReview = {
        user: user?.name || 'Anonymous',
        comment: comment.trim(),
        rating,
        createdAt: new Date().toISOString()
      }
      setReviews([newReview, ...reviews])
      
      // Reset form
      setComment('')
      setRating(5)
      
      alert('Review submitted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (val: number) => void; readonly?: boolean }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHoveredStar(star)}
            onMouseLeave={() => !readonly && setHoveredStar(0)}
            className={`text-2xl transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${
              star <= (readonly ? value : (hoveredStar || value))
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img 
              src={product.image || '/images/placeholder.jpg'} 
              alt={product.name} 
              className="w-full rounded shadow"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== window.location.origin + '/images/placeholder.jpg') {
                  target.src = '/images/placeholder.jpg';
                }
              }}
            />
          </div>
          <div>
            <h1 className="text-3xl font-display mb-4 text-[#5E372E]">{product.name}</h1>
            <p className="text-sm text-[#6b4f45] mb-4">{product.description}</p>
            <p className="text-xl font-bold text-[#5E372E] mb-2">${product.price.toFixed(2)}</p>
            <div className="mb-4">
              <span className="text-sm text-[#6b4f45] mr-3">Stock: <strong className="text-[#5E372E]">{product.stock}</strong></span>
              <span className={`text-sm px-2 py-0.5 rounded ${product.status === 'Out of Stock' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {product.status ?? 'Active'}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || product.status === 'Out of Stock'}
              className="bg-[#6b3f2f] hover:bg-[#5a3426] text-white px-6 py-2 rounded-md shadow-md transform transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-display mb-4 text-[#5E372E]">Description</h2>
          <p className="text-sm text-[#6b4f45]">{product.description || 'No description available.'}</p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-display mb-4 text-[#5E372E]">Ingredients</h2>
          <ul className="list-disc pl-6">
            {product.ingredients && product.ingredients.length > 0 ? (
              product.ingredients.map((ingredient: string, index: number) => (
                <li key={index} className="text-sm text-[#6b4f45]">{String(ingredient)}</li>
              ))
            ) : product.recipe && product.recipe.length > 0 ? (
              product.recipe.map((item: any, index: number) => {
                const materialName = typeof item.material === 'object' ? item.material?.name : item.material
                const materialUnit = typeof item.material === 'object' ? item.material?.unit : ''
                return (
                  <li key={index} className="text-sm text-[#6b4f45]">
                    {String(materialName || 'Material')}: {item.quantity} {String(materialUnit || '')}
                  </li>
                )
              })
            ) : (
              <li className="text-sm text-[#6b4f45]">No ingredient information.</li>
            )}
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-display mb-6 text-[#5E372E]">Customer Reviews</h2>
          
          {/* Review Submission Form */}
          {isAuthenticated ? (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#6b4f45] mb-2">Your Rating</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#6b4f45] mb-2">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] resize-none"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-[#6b4f45] mt-1">{comment.length} characters</p>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmittingReview || !comment.trim()}
                  className="bg-[#6b3f2f] hover:bg-[#5a3426] text-white px-6 py-2 rounded-md shadow-md transform transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
              <p className="text-sm text-amber-800">
                Please <a href="/login" className="underline font-medium">log in</a> to write a review.
              </p>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#5E372E]">{typeof review.user === 'object' ? review.user?.name || 'Anonymous' : String(review.user || 'Anonymous')}</p>
                      <StarRating value={review.rating || 5} readonly />
                    </div>
                    {review.createdAt && (
                      <span className="text-xs text-[#6b4f45]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#6b4f45]">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-sm text-[#6b4f45]">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-display mb-4 text-[#5E372E]">Related Products</h2>
          <div className="grid grid-cols-2 gap-4">
            {product.relatedProducts?.map(related => (
              <div key={related.id || related._id} className="bg-white p-4 rounded shadow">
                <img src={related.image} alt={String(related.name || '')} className="w-full h-32 object-cover rounded" />
                <p className="text-sm text-[#6b4f45] mt-2">{String(related.name || '')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage

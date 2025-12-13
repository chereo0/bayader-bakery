import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import productsData from '../admin/products/data'

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { addItem, showToast } = useCart()
  const { isAuthenticated, user } = useAuth()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [hoveredStar, setHoveredStar] = useState(0)

  const product = productsData.find(p => p.id === parseInt(id || ''))

  useEffect(() => {
    if (product?.reviews) {
      setReviews(product.reviews)
    }
  }, [product])

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>
  }

  const handleAddToCart = () => {
    addItem({ id: String(product.id), name: product.name, price: product.price, image: product.image })
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
            <img src={product.image} alt={product.name} className="w-full rounded shadow" />
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
          <p className="text-sm text-[#6b4f45]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse potenti.</p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-display mb-4 text-[#5E372E]">Ingredients</h2>
          <ul className="list-disc pl-6">
            {product.ingredients?.map((ingredient, index) => (
              <li key={index} className="text-sm text-[#6b4f45]">{ingredient}</li>
            )) ?? <li className="text-sm text-[#6b4f45]">No ingredient information.</li>}
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
                      <p className="font-semibold text-[#5E372E]">{review.user}</p>
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
              <div key={related.id} className="bg-white p-4 rounded shadow">
                <img src={related.image} alt={related.name} className="w-full h-32 object-cover rounded" />
                <p className="text-sm text-[#6b4f45] mt-2">{related.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage

import React from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import productsData from '../admin/products/data'

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { addItem, showToast } = useCart()

  const product = productsData.find(p => p.id === parseInt(id || ''))

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>
  }

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image })
    showToast(`${product.name} added to cart!`)
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
          <h2 className="text-2xl font-display mb-4 text-[#5E372E]">Reviews</h2>
          <ul className="space-y-4">
            {product.reviews?.map((review, index) => (
              <li key={index} className="bg-white p-4 rounded shadow">
                <p className="text-sm text-[#6b4f45]"><strong>{review.user}:</strong> {review.comment}</p>
              </li>
            )) ?? <li className="text-sm text-[#6b4f45]">No reviews yet.</li>}
          </ul>
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

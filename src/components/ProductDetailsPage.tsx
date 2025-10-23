import React from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const products = [
  {
    id: 1,
    name: 'Velvet Dream Cake',
    description: 'Creamy, fluffy red velvet cake.',
    price: 5.50,
    category: 'Cakes',
    image: '/images/cakes.jpg',
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Cocoa Powder'],
    reviews: [
      { user: 'Alice', comment: 'Delicious and moist!' },
      { user: 'Bob', comment: 'Perfect for my birthday party.' }
    ],
    relatedProducts: [
      { id: 2, name: 'Classic Chocolate Chip', image: '/images/cookies.jpg' },
      { id: 3, name: 'Cookies', image: '/images/cookies.jpg' }
    ]
  },
  {
    id: 2,
    name: 'Classic Chocolate Chip',
    description: 'Our best, crispy and savory.',
    price: 5.50,
    category: 'Cookies',
    image: '/images/cookies.jpg',
    ingredients: ['Flour', 'Sugar', 'Chocolate Chips'],
    reviews: [
      { user: 'Charlie', comment: 'Best cookies ever!' },
      { user: 'Dana', comment: 'Perfect with milk.' }
    ],
    relatedProducts: [
      { id: 1, name: 'Velvet Dream Cake', image: '/images/cakes.jpg' },
      { id: 3, name: 'Cookies', image: '/images/cookies.jpg' }
    ]
  },
  {
    id: 3,
    name: 'Cookies',
    description: 'Fluffy, buttery cookies.',
    price: 5.50,
    category: 'Cookies',
    image: '/images/cookies.jpg',
    ingredients: ['Flour', 'Sugar', 'Butter'],
    reviews: [
      { user: 'Eve', comment: 'So soft and tasty!' },
      { user: 'Frank', comment: 'My kids love them.' }
    ],
    relatedProducts: [
      { id: 1, name: 'Velvet Dream Cake', image: '/images/cakes.jpg' },
      { id: 2, name: 'Classic Chocolate Chip', image: '/images/cookies.jpg' }
    ]
  },
  {
    id: 4,
    name: 'Cookies',
    description: 'Fluffy, buttery cookies.',
    price: 5.50,
    category: 'Cookies',
    image: '/images/cookies.jpg',
    ingredients: ['Flour', 'Sugar', 'Butter'],
    reviews: [
      { user: 'Eve', comment: 'So soft and tasty!' },
      { user: 'Frank', comment: 'My kids love them.' }
    ],
    relatedProducts: [
      { id: 1, name: 'Velvet Dream Cake', image: '/images/cakes.jpg' },
      { id: 2, name: 'Classic Chocolate Chip', image: '/images/cookies.jpg' }
    ]
  },
  {
    id: 5,
    name: 'Cookies',
    description: 'Fluffy, buttery cookies.',
    price: 5.50,
    category: 'Cookies',
    image: '/images/cookies.jpg',
    ingredients: ['Flour', 'Sugar', 'Butter'],
    reviews: [
      { user: 'Eve', comment: 'So soft and tasty!' },
      { user: 'Frank', comment: 'My kids love them.' }
    ],
    relatedProducts: [
      { id: 1, name: 'Velvet Dream Cake', image: '/images/cakes.jpg' },
      { id: 2, name: 'Classic Chocolate Chip', image: '/images/cookies.jpg' }
    ]
  },
  {
    id: 6,
    name: 'Breakms',
    description: 'French style croissants.',
    price: 5.50,
    category: 'Breads',
    image: '/images/pastries.jpg',
    ingredients: ['Flour', 'Butter', 'Yeast'],
    reviews: [
      { user: 'Grace', comment: 'Perfectly flaky and buttery!' },
      { user: 'Hank', comment: 'Best croissants I have ever had.' }
    ],
    relatedProducts: [
      { id: 7, name: 'Artisan Bread', image: '/images/pastries.jpg' },
      { id: 8, name: 'Custom Cake', image: '/images/custom.jpg' }
    ]
  },
  {
    id: 7,
    name: 'Artisan Bread',
    description: 'Fresh baked daily.',
    price: 4.50,
    category: 'Breads',
    image: '/images/pastries.jpg',
    ingredients: ['Flour', 'Water', 'Yeast'],
    reviews: [
      { user: 'Ivy', comment: 'So fresh and delicious!' },
      { user: 'Jack', comment: 'Perfect for sandwiches.' }
    ],
    relatedProducts: [
      { id: 6, name: 'Breakms', image: '/images/pastries.jpg' },
      { id: 8, name: 'Custom Cake', image: '/images/custom.jpg' }
    ]
  },
  {
    id: 8,
    name: 'Custom Cake',
    description: 'Made to order for events.',
    price: 25.00,
    category: 'Cakes',
    image: '/images/custom.jpg',
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Custom Decorations'],
    reviews: [
      { user: 'Karen', comment: 'Beautiful and delicious!' },
      { user: 'Leo', comment: 'Perfect for my wedding.' }
    ],
    relatedProducts: [
      { id: 1, name: 'Velvet Dream Cake', image: '/images/cakes.jpg' },
      { id: 2, name: 'Classic Chocolate Chip', image: '/images/cookies.jpg' }
    ]
  }
]

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { addItem, showToast } = useCart()

  const product = products.find(p => p.id === parseInt(id || ''))

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
            <p className="text-xl font-bold text-[#5E372E] mb-4">${product.price.toFixed(2)}</p>
            <button
              onClick={handleAddToCart}
              className="bg-[#6b3f2f] hover:bg-[#5a3426] text-white px-6 py-2 rounded-md shadow-md transform transition-transform hover:scale-105"
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
            {product.ingredients.map((ingredient, index) => (
              <li key={index} className="text-sm text-[#6b4f45]">{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-display mb-4 text-[#5E372E]">Reviews</h2>
          <ul className="space-y-4">
            {product.reviews.map((review, index) => (
              <li key={index} className="bg-white p-4 rounded shadow">
                <p className="text-sm text-[#6b4f45]"><strong>{review.user}:</strong> {review.comment}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-display mb-4 text-[#5E372E]">Related Products</h2>
          <div className="grid grid-cols-2 gap-4">
            {product.relatedProducts.map(related => (
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

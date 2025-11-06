import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
}

const ProductsPage: React.FC = () => {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const productsRef = useRef<Array<HTMLDivElement | null>>([])
  const dotsRef = useRef<Array<HTMLDivElement | null>>([])

  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priceFilter, setPriceFilter] = useState<string>('all')

  const products: Product[] = [
    {
      id: 1,
      name: 'Velvet Dream Cake',
      description: 'Creamy, fluffy red velvet cake.',
      price: 5.50,
      category: 'Cakes',
      image: '/images/cakes.jpg'
    },
    {
      id: 2,
      name: 'Cakes',
      description: 'Perfect for any occasion.',
      price: 5.50,
      category: 'Cakes',
      image: '/images/cakes.jpg'
    },
    {
      id: 3,
      name: 'Classic Chocolate Chip',
      description: 'Our best, crispy and savory.',
      price: 5.50,
      category: 'Cookies',
      image: '/images/cookies.jpg'
    },
    {
      id: 4,
      name: 'Butella Themalt Muffords',
      description: 'Creamy, fluffy macaron.',
      price: 5.50,
      category: 'Cakes',
      image: '/images/cakes.jpg'
    },
    {
      id: 5,
      name: 'Cookies',
      description: 'Fluffy, buttery cookies.',
      price: 5.50,
      category: 'Cookies',
      image: '/images/cookies.jpg'
    },
    {
      id: 6,
      name: 'Breakms',
      description: 'French style croissants.',
      price: 5.50,
      category: 'Breads',
      image: '/images/pastries.jpg'
    },
    {
      id: 7,
      name: 'Artisan Bread',
      description: 'Fresh baked daily.',
      price: 4.50,
      category: 'Breads',
      image: '/images/pastries.jpg'
    },
    {
      id: 8,
      name: 'Custom Cake',
      description: 'Made to order for events.',
      price: 25.00,
      category: 'Cakes',
      image: '/images/custom.jpg'
    }
  ]

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)

  useEffect(() => {
    // Page fade in
    gsap.fromTo(
      '.products-page-container',
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }
    )

    // Header animation
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 }
      )
    }

    // Product cards stagger animation
    const cards = productsRef.current.filter(Boolean) as HTMLElement[]
    if (cards.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.4 }
      )
    }

    // Dotted decorative parallax
    const dots = dotsRef.current.filter(Boolean) as HTMLElement[]
    if (dots.length) {
      gsap.to(dots, {
        yPercent: -6,
        repeat: -1,
        yoyo: true,
        duration: 6,
        ease: 'sine.inOut',
        stagger: { each: 0.5 },
      })
    }
  }, [filteredProducts])

  const handleApplyFilters = () => {
    let filtered = products

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    if (priceFilter === 'low') {
      filtered = filtered.filter(p => p.price < 10)
    } else if (priceFilter === 'high') {
      filtered = filtered.filter(p => p.price >= 10)
    }

    setFilteredProducts(filtered)
  }

  const setRef = <T extends HTMLElement>(collection: React.MutableRefObject<Array<T | null>>, idx: number) => (el: T | null) => {
    collection.current[idx] = el
  }

  const { addItem, showToast } = useCart()

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image })
    showToast(`${product.name} added to cart!`)
  }

  return (
    <div className="products-page-container min-h-screen bg-[#F5F1E8] text-brown-900 relative overflow-x-hidden pt-8">
      {/* Decorative dotted clusters */}
      <div
        ref={setRef(dotsRef, 0)}
        className="pointer-events-none absolute top-24 right-12 opacity-50 transform-gpu"
        aria-hidden
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#C89A5A">
            {[...Array(18)].map((_, i) => {
              const angle = (i / 18) * Math.PI * 2
              const r = 30 + Math.sin(i) * 6
              const x = 60 + Math.cos(angle) * r
              const y = 60 + Math.sin(angle) * r
              return <circle key={i} cx={x} cy={y} r={3} />
            })}
          </g>
        </svg>
      </div>

      <div
        ref={setRef(dotsRef, 1)}
        className="pointer-events-none absolute bottom-32 left-16 opacity-40 transform-gpu"
        aria-hidden
      >
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#7B4A3D">
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2
              const r = 25
              const x = 50 + Math.cos(angle) * r
              const y = 50 + Math.sin(angle) * r
              return <circle key={i} cx={x} cy={y} r={2.5} />
            })}
          </g>
        </svg>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header Section */}
        <div ref={headerRef} className="text-center mb-8">
          <div className="text-6xl mb-4">🥐</div>
          <h1 className="text-4xl md:text-5xl font-display mb-2 text-[#5E372E]">
            Our Delicious Products
          </h1>
          <p className="text-sm text-[#6b4f45]">
            Log in to access your sweet deals
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white/95 rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6b4f45] mb-2">
                Filter by Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a] bg-white"
              >
                <option value="all">All Categories</option>
                <option value="Cakes">Cakes</option>
                <option value="Breads">Breads</option>
                <option value="Cookies">Cookies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6b4f45] mb-2">
                Filter by Price
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a] bg-white"
              >
                <option value="all">All Prices</option>
                <option value="low">Under $10</option>
                <option value="high">$10 and above</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="w-full bg-[#6b3f2f] hover:bg-[#5a3426] text-white px-6 py-2 rounded-md shadow-md transform transition-transform hover:scale-105"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => (productsRef.current[index] = el)}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-display text-[#5E372E] mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-[#6b4f45] mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[#5E372E]">
                    ${product.price.toFixed(2)}
                  </span>
                  <Link
                    to={`/product/${product.id}`}
                    className="bg-[#6b3f2f] hover:bg-[#5a3426] text-white px-4 py-2 rounded-md text-sm shadow-md transform transition-transform hover:scale-105"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6b4f45] text-lg">No products found matching your filters.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default ProductsPage

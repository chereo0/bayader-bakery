import React, { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import Button from './ui/Button'
import { productApi, Product as ApiProduct } from '../utils/api'

interface Product extends ApiProduct {
  id?: string | number;
}

const ProductsPage: React.FC = () => {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const productsRef = useRef<Array<HTMLDivElement | null>>([])
  const dotsRef = useRef<Array<HTMLDivElement | null>>([])

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name')
  const [categories, setCategories] = useState<string[]>(['Cakes', 'Pastries', 'Breads', 'Cookies', 'Custom Orders', 'Seasonal'])

  // Fallback products in case backend is not available
  const fallbackProducts: Product[] = [
    {
      _id: '1',
      name: 'Velvet Dream Cake',
      description: 'Creamy, fluffy red velvet cake.',
      price: 5.50,
      category: 'Cakes',
      image: '/images/cakes.jpg',
      stock: 10,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      name: 'Chocolate Layer Cake',
      description: 'Perfect for any occasion.',
      price: 7.50,
      category: 'Cakes',
      image: '/images/cakes.jpg',
      stock: 8,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '3',
      name: 'Classic Chocolate Chip',
      description: 'Our best, crispy and savory.',
      price: 5.50,
      category: 'Cookies',
      image: '/images/cookies.jpg',
      stock: 15,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '4',
      name: 'Vanilla Macaron',
      description: 'Creamy, fluffy macaron.',
      price: 5.50,
      category: 'Pastries',
      image: '/images/cakes.jpg',
      stock: 12,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '5',
      name: 'Butter Cookies',
      description: 'Fluffy, buttery cookies.',
      price: 5.50,
      category: 'Cookies',
      image: '/images/cookies.jpg',
      stock: 20,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '6',
      name: 'French Croissants',
      description: 'French style croissants.',
      price: 5.50,
      category: 'Pastries',
      image: '/images/pastries.jpg',
      stock: 14,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '7',
      name: 'Artisan Bread',
      description: 'Fresh baked daily.',
      price: 4.50,
      category: 'Breads',
      image: '/images/pastries.jpg',
      stock: 18,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '8',
      name: 'Custom Cake',
      description: 'Made to order for events.',
      price: 25.00,
      category: 'Cakes',
      image: '/images/custom.jpg',
      stock: 5,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '9',
      name: 'Sourdough Loaf',
      description: 'Tangy and delicious.',
      price: 6.50,
      category: 'Breads',
      image: '/images/pastries.jpg',
      stock: 9,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '10',
      name: 'Chocolate Éclair',
      description: 'Classic French pastry.',
      price: 4.00,
      category: 'Pastries',
      image: '/images/pastries.jpg',
      stock: 11,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Don't filter by status on initial load - let backend default to Active
        // This prevents "no products" issue when backend returns empty initially
        const result = await productApi.getProducts({
          limit: 1000
          // Removed status filter - backend defaults to 'Active'
        })

        // DEBUG: Log the full response
        console.log('🔍 API Response:', result)
        console.log('Success?', result.success)
        console.log('Data:', result.data)
        console.log('Products array:', result.data?.products)
        console.log('Products length:', result.data?.products?.length)

        if (result.success && result.data?.products) {
          const productsArray = result.data.products
          console.log(`✅ Loaded ${productsArray.length} products from backend`)
          
          if (productsArray.length > 0) {
            const mappedProducts = productsArray.map(p => ({
              ...p,
              image: p.image || '/images/products.jpg'
              // Don't set id - use _id directly
            }))
            console.log('Mapped products:', mappedProducts)
            setProducts(mappedProducts)
          } else {
            console.warn('⚠️ Products array is empty')
            setProducts(fallbackProducts)
          }
        } else {
          // Only use fallback if no products returned or API fails
          console.warn('❌ No products from backend or API failed, using fallback products')
          console.warn('Error:', result.error)
          setProducts(fallbackProducts)
        }
      } catch (err) {
        console.warn('❌ Error fetching products, using fallback:', err)
        setProducts(fallbackProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Extract unique categories from products
  const dynamicCategories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)))
    console.log('📂 Extracted categories from products:', cats)
    return cats.sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    console.log('🔄 Recalculating filteredProducts with:')
    console.log('  selectedCategory:', selectedCategory)
    console.log('  priceFilter:', priceFilter)
    console.log('  searchTerm:', searchTerm)
    console.log('  sortBy:', sortBy)
    console.log('  products.length:', products.length)

    let filtered = products
    console.log('  1. Start with all products:', filtered.length)

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
      console.log(`  2. After category filter (${selectedCategory}):`, filtered.length)
    }

    // Apply search filter
    if (searchTerm) {
      const before = filtered.length
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log(`  3. After search filter ("${searchTerm}"):`, filtered.length, `(removed ${before - filtered.length})`)
    }

    // Apply price filter
    if (priceFilter === 'low') {
      const before = filtered.length
      filtered = filtered.filter(p => p.price < 10)
      console.log(`  4. After price filter (under $10):`, filtered.length, `(removed ${before - filtered.length})`)
    } else if (priceFilter === 'high') {
      const before = filtered.length
      filtered = filtered.filter(p => p.price >= 10)
      console.log(`  4. After price filter ($10+):`, filtered.length, `(removed ${before - filtered.length})`)
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
      console.log('  5. Sorted by price (low to high)')
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
      console.log('  5. Sorted by price (high to low)')
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      console.log('  5. Sorted by name (A-Z)')
    }

    console.log('✅ Final filtered products:', filtered.length)
    console.log('📋 Filtered products:', filtered)

    return filtered
  }, [selectedCategory, priceFilter, searchTerm, sortBy, products])

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

  const setRef = <T extends HTMLElement>(collection: React.MutableRefObject<Array<T | null>>, idx: number) => (el: T | null) => {
    collection.current[idx] = el
  }

  const { addItem, showToast } = useCart()

  const handleAddToCart = (product: Product) => {
    // Use the MongoDB _id directly - must be a string ObjectId, not a number
    const productId = product._id;
    if (!productId || typeof productId !== 'string') {
      console.error('Invalid product ID:', productId, 'Type:', typeof productId);
      showToast('Error: Invalid product ID');
      return;
    }
    addItem({ 
      id: productId, 
      name: product.name, 
      price: product.price, 
      image: product.image 
    })
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
          {/* Search Bar */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-bakery-900 mb-2">Search Products</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-bakery-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bakery-700 transition"
            />
          </div>

          {/* Category Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-bakery-900 mb-3">Categories</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === 'all'
                    ? 'bg-bakery-900 text-white'
                    : 'bg-bakery-100 text-bakery-900 hover:bg-bakery-200'
                }`}
              >
                All Products ({products.length})
              </button>
              {dynamicCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-bakery-900 text-white'
                      : 'bg-bakery-100 text-bakery-900 hover:bg-bakery-200'
                  }`}
                >
                  {cat} ({products.filter(p => p.category === cat).length})
                </button>
              ))}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-bakery-900 mb-2">
                Price Range
              </label>
              <select
                title="Filter by Price Range"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full rounded-lg border border-bakery-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-700 bg-white"
              >
                <option value="all">All Prices</option>
                <option value="low">Under $10</option>
                <option value="high">$10 and above</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-bakery-900 mb-2">
                Sort By
              </label>
              <select
                title="Sort Products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-lg border border-bakery-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-700 bg-white"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSelectedCategory('all')
                  setPriceFilter('all')
                  setSearchTerm('')
                  setSortBy('name')
                }}
                variant="ghost"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedCategory !== 'all' || priceFilter !== 'all' || searchTerm || sortBy !== 'name') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>Active Filters:</strong> 
              {selectedCategory !== 'all' && ` Category: ${selectedCategory}`}
              {priceFilter !== 'all' && ` | Price: ${priceFilter === 'low' ? 'Under $10' : '$10+'}`}
              {searchTerm && ` | Search: "${searchTerm}"`}
              {sortBy !== 'name' && ` | Sort: ${sortBy.replace('-', ' ')}`}
            </div>
          )}
        </div>

        {/* Products Count */}
        <div className="mb-4 text-sm text-bakery-700">
          Showing <strong>{filteredProducts.length}</strong> product{filteredProducts.length !== 1 ? 's' : ''}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </div>

        {/* Loading State */}
        {loading && filteredProducts.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin">
                <svg className="w-12 h-12 text-bakery-900" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="mt-4 text-bakery-700 font-medium">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-medium">Error loading products:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Products Grid - Show if products available OR loading is complete */}
        {(filteredProducts.length > 0 || !loading) && (
          <>
            {(() => {
              console.log('🎨 RENDERING PRODUCTS GRID:', {
                loading,
                filteredProductsLength: filteredProducts.length,
                gridVisible: filteredProducts.length > 0,
                productsInDOM: productsRef.current.filter(Boolean).length,
              })
              return null
            })()}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => {
                console.log('🏷️ Rendering product:', product.name, 'at index:', index)
                return (
                <div
                  key={product._id}
                  ref={(el) => (productsRef.current[index] = el)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-105 flex flex-col h-full"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden bg-bakery-100 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 bg-bakery-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {product.category}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-lg font-display text-bakery-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-bakery-700 mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-3 border-t border-bakery-200">
                        <span className="text-2xl font-bold text-bakery-900">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 text-sm"
                      >
                        Add to Cart
                      </Button>
                      <Link
                        to={`/product/${product._id}`}
                        className="flex-1"
                      >
                        <Button variant="ghost" className="w-full text-sm">
                          Details →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-display text-bakery-900 mb-2">No products found</h3>
                <p className="text-bakery-700 mb-6">Try adjusting your filters or search terms</p>
                <Button 
                  onClick={() => {
                    setSelectedCategory('all')
                    setPriceFilter('all')
                    setSearchTerm('')
                    setSortBy('name')
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ProductsPage

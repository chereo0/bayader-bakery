export interface ProductItem {
  id: number
  name: string
  category: string
  image?: string
  description?: string
  price: number
  stock?: number
  status?: string
  ingredients?: string[]
  reviews?: Array<{ user: string; comment: string }>
  relatedProducts?: Array<{ id: number; name: string; image?: string }>
}

const products: ProductItem[] = [
  {
    id: 1,
    name: 'Classic Chocolate Cake',
    category: 'Cakes',
    image: '/images/cakes.jpg',
    description: 'Rich chocolate cake with ganache.',
    price: 29.99,
    stock: 5,
    status: 'Active',
    ingredients: ['Flour', 'Sugar', 'Cocoa', 'Eggs'],
    reviews: [{ user: 'Laila', comment: 'Delicious!' }],
    relatedProducts: [{ id: 2, name: 'Vanilla Cupcakes', image: '/images/pastries.jpg' }]
  },
  {
    id: 2,
    name: 'Vanilla Cupcakes',
    category: 'Pastries',
    image: '/images/pastries.jpg',
    description: 'Light and fluffy vanilla cupcakes.',
    price: 12.5,
    stock: 12,
    status: 'Active'
  }
]

export default products

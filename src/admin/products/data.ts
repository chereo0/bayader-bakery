export interface ProductItem {
  id: number
  name: string
  category: string
  stock: number
  price: number
  image: string
  status?: 'Active'|'Out of Stock'|'Draft'
  description?: string
  ingredients?: string[]
  reviews?: { user: string; comment: string }[]
  relatedProducts?: { id: number; name: string; image: string }[]
}

export const productsData: ProductItem[] = [
  {
    id: 1,
    name: 'Velvet Dream',
    category: 'Cakes',
    stock: 15,
    price: 45.0,
    image: '/images/cakes.jpg',
    status: 'Active',
    description: 'Creamy, fluffy red velvet cake.',
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Cocoa Powder'],
    reviews: [ { user: 'Alice', comment: 'Delicious and moist!' } ],
    relatedProducts: [ { id: 2, name: 'Almond Croissants', image: '/images/pastries.jpg' } ]
  },
  {
    id: 2,
    name: 'Almond Croissants',
    category: 'Pastries',
    stock: 0,
    price: 4.5,
    image: '/images/pastries.jpg',
    status: 'Out of Stock',
    description: 'Buttery, flaky croissants with toasted almonds.',
    ingredients: ['Flour', 'Butter', 'Almonds'],
    reviews: [ { user: 'Bob', comment: 'Crispy and flavorful.' } ],
    relatedProducts: [ { id: 1, name: 'Velvet Dream', image: '/images/cakes.jpg' } ]
  },
  {
    id: 3,
    name: 'Macarons',
    category: 'Desserts',
    stock: 50,
    price: 3.5,
    image: '/images/macaron.jpg',
    status: 'Active',
    description: 'Delicate French macarons in assorted flavors.',
    ingredients: ['Almond flour', 'Sugar', 'Egg whites'],
    reviews: [ { user: 'Catherine', comment: 'Light and perfect.' } ],
    relatedProducts: []
  },
  {
    id: 4,
    name: 'Lavender Macarons',
    category: 'Desserts',
    stock: 50,
    price: 3.75,
    image: '/images/macaron.jpg',
    status: 'Active',
    description: 'Lavender-infused delicate macarons.',
    ingredients: ['Almond flour', 'Sugar', 'Lavender'],
    reviews: [],
    relatedProducts: []
  }
]

export default productsData

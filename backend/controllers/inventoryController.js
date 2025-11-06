const Product = require('../models/Product')
const { LOW_STOCK_THRESHOLD } = require('../config')

// List inventory with optional filters
// GET /api/inventory
const listInventory = async (req, res) => {
  const { category, status, search, sort = '-createdAt', page = 1, limit = 20 } = req.query

  const query = {}
  if (category) query.category = category
  if (status) query.status = status
  if (search) query.$text = { $search: search }

  const skip = (parseInt(page) - 1) * parseInt(limit)

  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select('name category stock price status')
    .lean()

  const total = await Product.countDocuments(query)

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  })
}

// GET /api/inventory/low-stock
const getLowStock = async (req, res) => {
  const threshold = parseInt(req.query.threshold) || LOW_STOCK_THRESHOLD || 10

  const products = await Product.find({ stock: { $lte: threshold }, status: { $ne: 'Inactive' } })
    .sort('stock')
    .select('name category stock price')
    .lean()

  res.json({ success: true, data: { products, count: products.length, threshold } })
}

// PATCH /api/inventory/:id/stock
const updateStock = async (req, res) => {
  const { quantity, operation = 'set' } = req.body

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ success: false, message: 'Valid quantity is required' })
  }

  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

  if (operation === 'add') {
    product.stock += quantity
  } else if (operation === 'subtract') {
    product.stock = Math.max(0, product.stock - quantity)
  } else {
    product.stock = quantity
  }

  await product.save()

  res.json({ success: true, data: product })
}

module.exports = { listInventory, getLowStock, updateStock }

const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')
const { listInventory, getLowStock, updateStock } = require('../controllers/inventoryController')
const { updateStockSchema, validate } = require('../validators/inventoryValidation')

// List inventory (admin/staff)
router.get('/', auth, requireRole('admin', 'staff'), listInventory)
// Low stock
router.get('/low-stock', auth, requireRole('admin', 'staff'), getLowStock)
// Update stock
router.patch('/:id/stock', auth, requireRole('admin', 'staff'), validate(updateStockSchema), updateStock)

module.exports = router

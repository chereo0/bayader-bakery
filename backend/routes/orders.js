const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getStaffOrders,
  getStaffOrderStats,
} = require('../controllers/orderController');

// Customer: create order
router.post('/', auth, createOrder);

// Customer: get my orders
router.get('/my', auth, getMyOrders);

// Get order by id (owner or admin/staff/driver)
router.get('/:id', auth, getOrderById);

// Staff: get orders organized by status for staff dashboard
router.get('/staff/dashboard', auth, requireRole('staff', 'admin'), getStaffOrders);

// Staff: get order status statistics
router.get('/staff/stats', auth, requireRole('staff', 'admin'), getStaffOrderStats);

// Admin/Staff: list all orders
router.get('/', auth, requireRole('admin', 'staff'), getAllOrders);

// Admin/Staff/Driver: update status
router.patch('/:id/status', auth, requireRole('admin', 'staff', 'driver'), updateOrderStatus);

// Customer: cancel order
router.patch('/:id/cancel', auth, cancelOrder);

module.exports = router;

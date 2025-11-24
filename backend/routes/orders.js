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
  getDriverOrders,
  updateDeliveryStatus,
  assignOrderToDriver,
} = require('../controllers/orderController');

// Customer: create order
router.post('/', auth, createOrder);

// Customer: get my orders
router.get('/my', auth, getMyOrders);

// Driver: get my assigned orders
router.get('/driver/my-orders', auth, requireRole('driver'), getDriverOrders);

// Get order by id (owner or admin/staff/driver)
router.get('/:id', auth, getOrderById);

// Staff: get orders organized by status for staff dashboard
router.get('/staff/dashboard', auth, requireRole('staff', 'admin'), getStaffOrders);

// Staff: get order status statistics
router.get('/staff/stats', auth, requireRole('staff', 'admin'), getStaffOrderStats);

// Admin/Staff: list all orders
router.get('/', auth, requireRole('admin', 'staff'), getAllOrders);

// Admin/Staff/Driver: update order status
router.patch('/:id/status', auth, requireRole('admin', 'staff', 'driver'), updateOrderStatus);

// Driver: update delivery status (in-transit, delivered, failed)
router.patch('/:id/delivery-status', auth, requireRole('driver'), updateDeliveryStatus);

// Admin/Staff: assign order to driver
router.patch('/:id/assign-driver', auth, requireRole('admin', 'staff'), assignOrderToDriver);

// Customer: cancel order
router.patch('/:id/cancel', auth, cancelOrder);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getAllDeliveries,
  getDeliveryById,
  assignDriver,
  updateDeliveryStatus,
  getMyDeliveries,
  getDrivers,
} = require('../controllers/deliveryController');

// Admin/Staff: Get drivers list
router.get('/drivers', auth, requireRole('admin', 'staff'), getDrivers);

// Admin/Staff: Get all deliveries with filters
router.get('/', auth, requireRole('admin', 'staff'), getAllDeliveries);

// Driver: Get my assigned deliveries
router.get('/my', auth, requireRole('driver'), getMyDeliveries);

// Get delivery by ID (admin/staff/driver)
router.get('/:id', auth, requireRole('admin', 'staff', 'driver'), getDeliveryById);

// Admin/Staff: Assign driver to delivery
router.patch('/:id/assign', auth, requireRole('admin', 'staff'), assignDriver);

// Update delivery status (admin/staff/driver can update)
router.patch('/:id/status', auth, requireRole('admin', 'staff', 'driver'), updateDeliveryStatus);

module.exports = router;

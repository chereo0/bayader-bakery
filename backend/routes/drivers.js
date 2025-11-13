const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createDriver,
  getAllDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
  resetDriverPassword
} = require('../controllers/driverController');

// All driver routes require authentication
// Only admin can create/delete drivers
// Admin and staff can view/update

// Create new driver (Admin only)
router.post('/', auth, requireRole('admin'), createDriver);

// Get all drivers (Admin/Staff)
router.get('/', auth, requireRole('admin', 'staff'), getAllDrivers);

// Get driver by ID (Admin/Staff)
router.get('/:id', auth, requireRole('admin', 'staff'), getDriver);

// Update driver (Admin/Staff)
router.put('/:id', auth, requireRole('admin', 'staff'), updateDriver);

// Delete driver (Admin only)
router.delete('/:id', auth, requireRole('admin'), deleteDriver);

// Reset driver password (Admin only)
router.post('/:id/reset-password', auth, requireRole('admin'), resetDriverPassword);

module.exports = router;

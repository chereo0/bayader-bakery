const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// All production routes require authentication and staff/admin role
router.use(auth);
router.use(requireRole('staff', 'admin'));

// Get production statistics (MUST be before /:id routes)
router.get('/stats', productionController.getStats);

// Bulk update statuses (MUST be before /:id routes)
router.put('/bulk/status', productionController.bulkUpdateStatus);

// Get production queue with filtering
router.get('/', productionController.getQueue);

// Create new production task
router.post('/', productionController.createTask);

// Get task details (MUST be after specific routes)
router.get('/:id', productionController.getTaskDetails);

// Get batch information
router.get('/:id/batch', productionController.getBatchInfo);

// Update task status
router.put('/:id/status', productionController.updateStatus);

// Mark task as ready
router.put('/:id/mark-ready', productionController.markReady);

// Assign staff to task
router.put('/:id/assign', productionController.assignStaff);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createOrderIssue,
  getOrderIssues,
  updateOrderIssue,
  getAllIssues
} = require('../controllers/orderIssuesController');

// Create order issue (Admin/Staff)
router.post('/', auth, requireRole('admin', 'staff'), createOrderIssue);

// Get all issues (Admin)
router.get('/', auth, requireRole('admin'), getAllIssues);

// Get issues for specific order (Admin/Staff)
router.get('/order/:orderId', auth, requireRole('admin', 'staff'), getOrderIssues);

// Update issue status (Admin)
router.patch('/:id', auth, requireRole('admin'), updateOrderIssue);

module.exports = router;

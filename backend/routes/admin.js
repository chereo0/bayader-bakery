const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { getSummary, getTopProducts, getSalesByDay } = require('../controllers/adminAnalyticsController');

// All admin analytics routes require auth and admin/staff role
router.get('/analytics/summary', auth, requireRole('admin', 'staff'), getSummary);
router.get('/analytics/top-products', auth, requireRole('admin', 'staff'), getTopProducts);
router.get('/analytics/sales-by-day', auth, requireRole('admin', 'staff'), getSalesByDay);

module.exports = router;

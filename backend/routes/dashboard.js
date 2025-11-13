const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// All dashboard routes require authentication and staff/admin role
router.use(auth);
router.use(requireRole('staff', 'admin'));

// Get main dashboard statistics with summary and trends
router.get('/stats', dashboardController.getDashboardStats);

// Get quick overview of order and production status breakdown
router.get('/overview', dashboardController.getQuickOverview);

// Get performance metrics
router.get('/metrics', dashboardController.getPerformanceMetrics);

module.exports = router;

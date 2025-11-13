const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getAlerts,
  getAlertsSummary,
  createAlert,
  resolveAlert,
  acknowledgeAlert,
  requestReplenishment,
  exportReport,
  syncAlertsFromProducts
} = require('../controllers/inventoryAlertController');

// All routes require authentication and staff/admin role
router.use(auth);
router.use(requireRole('staff', 'admin'));

// GET alerts with pagination and filters
router.get('/', getAlerts);

// GET alerts summary
router.get('/summary', getAlertsSummary);

// POST create new alert
router.post('/', createAlert);

// PUT resolve alert
router.put('/:id/resolve', resolveAlert);

// PUT acknowledge alert
router.put('/:id/acknowledge', acknowledgeAlert);

// POST request replenishment
router.post('/:id/request-replenishment', requestReplenishment);

// GET export report as CSV
router.get('/report/export', exportReport);

// POST sync alerts from products
router.post('/sync', syncAlertsFromProducts);

module.exports = router;

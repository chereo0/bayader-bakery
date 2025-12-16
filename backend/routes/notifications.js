const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// CRITICAL: Cache control FIRST to prevent 304 responses
router.use((req, res, next) => {
  console.log('[NOTIFICATIONS-ROUTE] 🟡 Incoming request:', { method: req.method, path: req.path, url: req.url });
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// CRITICAL: Authentication middleware SECOND (after cache control)
router.use(auth);

// CRITICAL: Most specific routes FIRST, general routes LAST
// Get unread count (MUST come before /me route to avoid matching issues)
router.get('/unread-count', (req, res, next) => {
  console.log('[NOTIFICATIONS-ROUTE] 🟢 Routing to getUnreadCount');
  next();
}, notificationController.getUnreadCount);

// Get notifications by category (MUST come before /:id routes)
router.get('/by-category', (req, res, next) => {
  console.log('[NOTIFICATIONS-ROUTE] 🟢 Routing to getNotificationsByCategory');
  next();
}, notificationController.getNotificationsByCategory);

// Get notifications for current user (MUST come after specific routes)
router.get('/me', (req, res, next) => {
  console.log('[NOTIFICATIONS-ROUTE] 🟢 Routing to getNotifications via /me');
  next();
}, notificationController.getNotifications);

// Alias for /me
router.get('/', (req, res, next) => {
  console.log('[NOTIFICATIONS-ROUTE] 🟢 Routing to getNotifications via /');
  next();
}, notificationController.getNotifications);

// Mark all as read (MUST come BEFORE :id routes to avoid matching "mark-all" as an ID)
router.put('/mark-all/read', (req, res, next) => {
  console.log('[NOTIFICATIONS-ROUTE] 🟢 Routing to markAllAsRead');
  next();
}, notificationController.markAllAsRead);

// Mark notification as read (parameterized route, MUST come after specific routes)
router.put('/:id/read', (req, res, next) => {
  console.log('[NOTIFICATIONS-ROUTE] 🟢 Routing to markAsRead');
  next();
}, notificationController.markAsRead);

// Delete notification (parameterized route, MUST come after specific routes)
router.delete('/:id', (req, res, next) => {
  console.log('[NOTIFICATIONS-ROUTE] 🟢 Routing to deleteNotification');
  next();
}, notificationController.deleteNotification);

// Create notification (admin/system only)
router.post('/', (req, res, next) => {
  console.log('[NOTIFICATIONS-ROUTE] 🟢 Routing to createNotification');
  next();
}, notificationController.createNotification);

module.exports = router;

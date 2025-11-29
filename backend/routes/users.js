const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getMySettings,
  updateMySettings,
  updateMyPassword
} = require('../controllers/userController');

// Staff/User settings routes (protected, any authenticated user)
router.get('/settings/me', auth, getMySettings);
router.put('/settings/me', auth, updateMySettings);
router.put('/settings/me/password', auth, updateMyPassword);

// Alias routes for frontend compatibility (/me instead of /settings/me)
router.get('/me', auth, getMySettings);
router.patch('/me', auth, updateMySettings);
router.post('/change-password', auth, updateMyPassword);

// List users - authenticated users can view (staff needs to find admins for messaging)
// Supports ?role=admin|staff|driver|customer to filter
router.get('/', auth, listUsers);

// Admin-only routes
router.get('/:id', auth, requireRole('admin'), getUser);
router.post('/', auth, requireRole('admin'), createUser);
router.put('/:id', auth, requireRole('admin'), updateUser);
router.delete('/:id', auth, requireRole('admin'), deleteUser);
// Bulk delete: pass JSON body { ids: [] }
router.delete('/', auth, requireRole('admin'), bulkDeleteUsers);
// Alias for clients that can't send body with DELETE
router.post('/bulk-delete', auth, requireRole('admin'), bulkDeleteUsers);

module.exports = router;

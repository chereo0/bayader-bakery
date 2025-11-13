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

// Admin routes
router.get('/', auth, requireRole('admin'), listUsers);
router.get('/:id', auth, requireRole('admin'), getUser);
router.post('/', auth, requireRole('admin'), createUser);
router.put('/:id', auth, requireRole('admin'), updateUser);
router.delete('/:id', auth, requireRole('admin'), deleteUser);
// Bulk delete: pass JSON body { ids: [] }
router.delete('/', auth, requireRole('admin'), bulkDeleteUsers);
// Alias for clients that can't send body with DELETE
router.post('/bulk-delete', auth, requireRole('admin'), bulkDeleteUsers);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  listMessages,
  getConversations,
  getMessage,
  sendMessage,
  markAsRead,
  markAsUnread,
  deleteMessage,
  unarchiveMessage,
  getUnreadCount
} = require('../controllers/messageController');

// All message routes require authentication
router.use(auth);

// GET conversations (all messages where user is sender or receiver)
router.get('/conversations/all', getConversations);

// GET messages (inbox only - messages TO user)
router.get('/', listMessages);

// GET unread count
router.get('/unread/count', getUnreadCount);

// GET specific message
router.get('/:id', getMessage);

// POST send message
router.post('/', sendMessage);

// PUT and PATCH mark as read (support both verbs for various clients)
router.put('/:id/read', markAsRead);
router.patch('/:id/read', auth, requireRole('admin', 'staff', 'driver'), markAsRead);

// PUT mark as unread
router.put('/:id/unread', markAsUnread);

// PATCH archive message (soft archive)
router.patch('/:id/archive', deleteMessage);

// PATCH unarchive message (restore to inbox)
router.patch('/:id/unarchive', unarchiveMessage);

// DELETE archive message (deprecated - use PATCH /archive instead)
// Keep DELETE admin-only to prevent misuse
router.delete('/:id', requireRole('admin'), deleteMessage);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  listMessages,
  getMessage,
  sendMessage,
  markAsRead,
  markAsUnread,
  deleteMessage,
  getUnreadCount
} = require('../controllers/messageController');

// All message routes require authentication
router.use(auth);

// GET messages (inbox)
router.get('/', listMessages);

// GET unread count
router.get('/unread/count', getUnreadCount);

// GET specific message
router.get('/:id', getMessage);

// POST send message
router.post('/', sendMessage);

// PUT mark as read
router.put('/:id/read', markAsRead);

// PUT mark as unread
router.put('/:id/unread', markAsUnread);

// DELETE archive message
router.delete('/:id', deleteMessage);

module.exports = router;

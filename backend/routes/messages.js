const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  listMessages,
  getConversations,
  getMessage,
  sendMessage,
  markAsRead,
  markAsUnread,
  deleteMessage,
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

// PUT mark as read
router.put('/:id/read', markAsRead);

// PUT mark as unread
router.put('/:id/unread', markAsUnread);

// DELETE archive message
router.delete('/:id', deleteMessage);

module.exports = router;

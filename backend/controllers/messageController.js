const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/messages - List messages for current user (inbox)
// Supports ?fromRole=admin|staff|driver to filter by sender role
const listMessages = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const filter = { to: req.user.id, isArchived: false };

    // Filter by read status if specified
    if (req.query.read === 'true') filter.read = true;
    if (req.query.read === 'false') filter.read = false;

    // Filter by sender role if specified
    if (req.query.fromRole) {
      const validRoles = ['admin', 'staff', 'driver', 'customer'];
      if (validRoles.includes(req.query.fromRole)) {
        // Get all users with specified role
        const usersWithRole = await User.find({ role: req.query.fromRole }).select('_id');
        const userIds = usersWithRole.map(u => u._id);
        filter.from = { $in: userIds };
      }
    }

    const total = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .populate('from', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: messages,
      meta: { total, page, limit, unreadCount: await Message.countDocuments({ to: req.user.id, read: false, isArchived: false }) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/messages/conversations - Get all messages (sent or received)
const getConversations = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    // Show all messages where user is sender OR receiver
    const filter = {
      $or: [
        { to: req.user.id, isArchived: false },
        { from: req.user.id, isArchived: false }
      ]
    };

    // Filter by read status if specified
    if (req.query.read === 'true') filter.read = true;
    if (req.query.read === 'false') filter.read = false;

    const total = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .populate('from', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: messages,
      meta: { total, page, limit, unreadCount: await Message.countDocuments({ to: req.user.id, read: false, isArchived: false }) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/messages/:id - Get specific message
const getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id).populate('from', 'name email role phone');
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user is sender or recipient
    if (message.to.toString() !== req.user.id && message.from.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/messages - Send new message
const sendMessage = async (req, res) => {
  try {
    const { to, subject, message, type } = req.body;

    // Validation
    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, message: 'to, subject, and message are required' });
    }

    // Check if recipient exists
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    // Prevent sending to self
    if (to === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot send message to yourself' });
    }

    const newMessage = new Message({
      from: req.user.id,
      to,
      subject,
      message,
      type: type || 'staff'
    });

    await newMessage.save();
    await newMessage.populate('from', 'name email role');

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/messages/:id/read - Mark message as read
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user is sender or recipient
    if (message.to.toString() !== req.user.id && message.from.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.json({ success: true, data: message, message: 'Message marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/messages/:id/unread - Mark message as unread
const markAsUnread = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user is sender or recipient
    if (message.to.toString() !== req.user.id && message.from.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    message.read = false;
    message.readAt = null;
    await message.save();

    res.json({ success: true, data: message, message: 'Message marked as unread' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/messages/:id - Archive/delete message
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user is sender or recipient
    if (message.to.toString() !== req.user.id && message.from.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    message.isArchived = true;
    await message.save();

    res.json({ success: true, message: 'Message archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/messages/unread/count - Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      to: req.user.id,
      read: false,
      isArchived: false
    });

    res.json({ success: true, data: { unreadCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listMessages,
  getConversations,
  getMessage,
  sendMessage,
  markAsRead,
  markAsUnread,
  deleteMessage,
  getUnreadCount
};

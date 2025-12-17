const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

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
      .populate('to', 'name email role')
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
    const archived = req.query.archived === 'true';
    
    // Base match criteria
    const matchStage = {
      $or: [
        { to: new mongoose.Types.ObjectId(req.user.id) },
        { from: new mongoose.Types.ObjectId(req.user.id) }
      ],
      isArchived: archived
    };

    // Filter by read status if specified
    if (req.query.read === 'true') matchStage.read = true;
    if (req.query.read === 'false') matchStage.read = false;

    const aggregation = [
      // 1. Match relevant messages
      { $match: matchStage },
      // 2. Sort by newest first to ensure we pick the latest message
      { $sort: { createdAt: -1 } },
      // 3. Group by "conversation partner"
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$from", new mongoose.Types.ObjectId(req.user.id)] },
              then: "$to",
              else: "$from"
            }
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      // 4. Restore the message document structure
      { $replaceRoot: { newRoot: "$lastMessage" } },
      // 5. Sort conversations by last message time
      { $sort: { createdAt: -1 } },
      // 6. Pagination & Population in Facet
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            // Populate sender
            {
              $lookup: {
                from: 'users',
                localField: 'from',
                foreignField: '_id',
                as: 'from'
              }
            },
            { $unwind: { path: '$from', preserveNullAndEmptyArrays: true } },
            // Populate recipient
            {
              $lookup: {
                from: 'users',
                localField: 'to',
                foreignField: '_id',
                as: 'to'
              }
            },
            { $unwind: { path: '$to', preserveNullAndEmptyArrays: true } },
            // Project needed fields
            {
               $project: {
                   subject: 1,
                   message: 1,
                   body: 1,
                   read: 1,
                   readAt: 1,
                   type: 1,
                   createdAt: 1,
                   updatedAt: 1,
                   isArchived: 1,
                   'from._id': 1, 'from.name': 1, 'from.email': 1, 'from.role': 1,
                   'to._id': 1, 'to.name': 1, 'to.email': 1, 'to.role': 1
               }
            }
          ],
          totalCount: [
            { $count: 'total' }
          ]
        }
      }
    ];

    const result = await Message.aggregate(aggregation);
    const messages = result[0].data;
    const total = result[0].totalCount[0] ? result[0].totalCount[0].total : 0;

    res.json({
      success: true,
      data: messages,
      meta: { total, page, limit, unreadCount: await Message.countDocuments({ to: req.user.id, read: false, isArchived: false }) }
    });
  } catch (err) {
    console.error('getConversations error:', err);
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
    await newMessage.populate('to', 'name email role');

    // Create notification for the recipient
    try {
      const sender = await User.findById(req.user.id);
      const notification = new Notification({
        recipient: to,
        title: '💬 New Message',
        message: `New message from ${sender.name}: ${subject}`,
        type: 'info',
        category: 'message',
        priority: 'normal',
        action: {
          url: '/messages',
          label: 'View Message'
        }
      });
      await notification.save();

      // Emit via WebSocket if available
      const socketHelpers = req.app.get('socketHelpers');
      if (socketHelpers) {
        socketHelpers.emitNotification(to, {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category,
          priority: notification.priority,
          action: notification.action,
          read: false,
          createdAt: notification.createdAt
        });
      }
    } catch (notifError) {
      console.error('[MESSAGE] Failed to create notification:', notifError);
      // Continue even if notification fails
    }

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

// DELETE /api/messages/:id - Archive message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user is sender or recipient (both can archive)
    if (message.to.toString() !== req.user.id && message.from.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    message.isArchived = true;
    message.archivedAt = new Date();
    await message.save();

    res.json({ success: true, message: 'Message archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/messages/:id/unarchive - Unarchive message (restore to inbox)
const unarchiveMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user is sender or recipient (both can unarchive)
    if (message.to.toString() !== req.user.id && message.from.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    message.isArchived = false;
    message.archivedAt = null;
    await message.save();

    res.json({ success: true, data: message, message: 'Message restored to inbox' });
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

// GET /api/messages/thread/:userId - Get conversation thread with a specific user
const getThread = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.id;

    // Validate otherUserId
    if (!otherUserId) {
       return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId }
      ],
      // We generally want to see archived messages in a thread view if the conversation is open,
      // or we can filter them out. Let's include them for now to show full history unless specific requirement says otherwise.
      // But typically "Archive" acts like "Hidden from inbox list". If I explicitly open a chat, I might want to see history.
      // However, existing simple logic filtered archived. Let's stick to showing non-archived for safety or allow query param.
      // For now, let's show ALL to ensure context, unless user deleted (which is different).
      // isArchived is usually per-message. If I archived a message, it shouldn't show in main list.
      // But in a thread view? Logic can be tricky.
      // Let's assume for "Chat View" we want to see everything 
      // OR let's respect isArchived=false to be consistent with "Inbox".
      isArchived: false 
    })
    .sort({ createdAt: 1 }) // Oldest first for chat history
    .populate('from', 'name email role');

    res.json({
      success: true,
      data: messages
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Archive entire conversation with a user
const archiveConversation = async (req, res) => {
  try {
    const partnerId = req.params.partnerId;
    const userId = req.user.id;

    await Message.updateMany(
      {
        $or: [
          { from: userId, to: partnerId },
          { from: partnerId, to: userId }
        ]
      },
      { isArchived: true, archivedAt: Date.now() }
    );

    res.json({ success: true, message: 'Conversation archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Unarchive entire conversation with a user
const unarchiveConversation = async (req, res) => {
  try {
    const partnerId = req.params.partnerId;
    const userId = req.user.id;

    await Message.updateMany(
      {
        $or: [
          { from: userId, to: partnerId },
          { from: partnerId, to: userId }
        ]
      },
      { isArchived: false, archivedAt: null }
    );

    res.json({ success: true, message: 'Conversation unarchived' });
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
  unarchiveMessage,
  getUnreadCount,
  getThread,
  archiveConversation,
  unarchiveConversation
};

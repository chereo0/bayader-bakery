const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, read = false, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = { recipient: req.user._id };
    
    if (read !== undefined) {
      filter.read = read === 'true';
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(filter);

    logger.info(`Notifications fetched for user ${req.user._id}: ${notifications.length} items`);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching notifications', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    logger.error('Error fetching unread count', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        read: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    logger.info(`Notification marked as read: ${id}`);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    logger.error('Error marking notification as read', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    logger.info(`All notifications marked as read for user ${req.user._id}`, result);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    logger.error('Error marking all notifications as read', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create notification (internal use)
exports.createNotification = async (req, res) => {
  try {
    const { recipientId, type, title, message, category, priority, relatedId, relatedModel, action, metadata } = req.body;

    if (!recipientId || !title || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const notification = await Notification.create({
      recipient: recipientId,
      type: type || 'info',
      title,
      message,
      category: category || 'system',
      priority: priority || 'normal',
      relatedId: relatedId || null,
      relatedModel: relatedModel || null,
      action: action || null,
      metadata: metadata || null
    });

    logger.info(`Notification created for user ${recipientId}`, { type, category });

    res.status(201).json({
      success: true,
      message: 'Notification created',
      data: notification
    });
  } catch (error) {
    logger.error('Error creating notification', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    logger.info(`Notification deleted: ${id}`);

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    logger.error('Error deleting notification', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get notifications by category for dashboard
exports.getNotificationsByCategory = async (req, res) => {
  try {
    const notifications = await Notification.aggregate([
      {
        $match: {
          recipient: req.user._id
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          recent: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          recent: { $slice: ['$recent', 3] }
        }
      }
    ]);

    logger.info(`Notifications by category fetched for user ${req.user._id}`);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    logger.error('Error fetching notifications by category', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

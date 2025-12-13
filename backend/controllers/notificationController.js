const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    console.log('[NOTIFICATIONS] 🔵 getNotifications() called for path:', req.path);
    console.log('[NOTIFICATIONS] 🔵 User authenticated:', !!req.user, req.user?._id || req.user?.id);
    
    // CRITICAL: Set JSON content type IMMEDIATELY
    res.set('Content-Type', 'application/json');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    // Defensive: Ensure user is authenticated
    if (!req.user || (!req.user._id && !req.user.id)) {
      console.log('[NOTIFICATIONS] ❌ User not authenticated - returning 401');
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated',
        data: []
      });
    }

    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 10, read = false, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = { recipient: userId };
    
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

    console.log('[NOTIFICATIONS] ✅ Notifications fetched:', { userId, count: notifications.length, total });

    // Always return JSON, never HTML
    res.json({
      success: true,
      data: notifications || [],
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.log('[NOTIFICATIONS] ❌ Error fetching notifications:', error.message);
    // Ensure error response is JSON
    res.set('Content-Type', 'application/json');
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications',
      error: error.message,
      data: []
    });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    console.log('[NOTIFICATIONS-UNREAD] 🔵 getUnreadCount() called for path:', req.path);
    console.log('[NOTIFICATIONS-UNREAD] 🔵 User authenticated:', !!req.user, req.user?._id || req.user?.id);
    
    // CRITICAL: Set JSON content type IMMEDIATELY
    res.set('Content-Type', 'application/json');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    // Defensive: Ensure user is authenticated
    if (!req.user || (!req.user._id && !req.user.id)) {
      console.log('[NOTIFICATIONS-UNREAD] ❌ User not authenticated - returning 401');
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated',
        data: { unreadCount: 0 }
      });
    }

    const userId = req.user._id || req.user.id;
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    console.log('[NOTIFICATIONS-UNREAD] ✅ Unread count fetched:', { userId, unreadCount });

    res.json({
      success: true,
      data: { unreadCount: unreadCount || 0 }
    });
  } catch (error) {
    console.log('[NOTIFICATIONS-UNREAD] ❌ Error fetching unread count:', error.message);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unread count',
      error: error.message,
      data: { unreadCount: 0 }
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    console.log('[NOTIFICATIONS-MARK] 🔵 markAsRead() called for notification:', req.params.id);
    console.log('[NOTIFICATIONS-MARK] 🔵 User:', req.user?._id || req.user?.id);
    
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
      console.log('[NOTIFICATIONS-MARK] ❌ Notification not found:', id);
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    console.log('[NOTIFICATIONS-MARK] ✅ Notification marked as read:', {
      id: notification._id,
      read: notification.read,
      readAt: notification.readAt
    });

    logger.info(`Notification marked as read: ${id}`);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.log('[NOTIFICATIONS-MARK] ❌ Error:', error.message);
    logger.error('Error marking notification as read', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    console.log('[NOTIFICATIONS-MARK-ALL] 🔵 markAllAsRead() called for user:', req.user?._id || req.user?.id);
    
    const userId = req.user._id || req.user.id;
    
    // Check how many unread notifications exist
    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });
    console.log('[NOTIFICATIONS-MARK-ALL] 🔵 Found unread notifications:', unreadCount);
    
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );

    console.log('[NOTIFICATIONS-MARK-ALL] ✅ Updated:', result.modifiedCount, 'notifications');
    logger.info(`All notifications marked as read for user ${userId}`, result);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.log('[NOTIFICATIONS-MARK-ALL] ❌ Error:', error.message);
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

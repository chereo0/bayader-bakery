const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('./logger');

// Store connected users: userId -> socketId
const connectedUsers = new Map();

module.exports = (io) => {
  io.use((socket, next) => {
    // Authenticate socket connection
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      logger.error('Socket authentication failed:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;
    
    logger.info(`[Socket.IO] User connected: ${userId} (${userRole}) - Socket: ${socket.id}`);
    
    // Store connection
    connectedUsers.set(userId, socket.id);
    
    // Join user to their personal room
    socket.join(userId);
    
    // Join role-based rooms
    socket.join(userRole);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`[Socket.IO] User disconnected: ${userId} - Socket: ${socket.id}`);
      connectedUsers.delete(userId);
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle notification read acknowledgment
    socket.on('notification:read', (notificationId) => {
      logger.info(`[Socket.IO] Notification ${notificationId} read by ${userId}`);
    });

    // Emit connection success
    socket.emit('connected', { userId, role: userRole });
  });

  return {
    // Helper function to emit notification to specific user
    emitNotification: (userId, notification) => {
      const socketId = connectedUsers.get(userId);
      if (socketId) {
        io.to(userId).emit('notification', notification);
        logger.info(`[Socket.IO] Notification sent to user ${userId}`);
        return true;
      }
      logger.warn(`[Socket.IO] User ${userId} not connected, notification queued`);
      return false;
    },

    // Helper function to emit to all users with a specific role
    emitToRole: (role, event, data) => {
      io.to(role).emit(event, data);
      logger.info(`[Socket.IO] Event '${event}' sent to role: ${role}`);
    },

    // Helper function to emit order update to driver
    emitOrderUpdate: (driverId, order) => {
      io.to(driverId).emit('order:update', order);
      logger.info(`[Socket.IO] Order update sent to driver ${driverId}`);
    },

    // Get connected users count
    getConnectedUsersCount: () => connectedUsers.size,

    // Check if user is connected
    isUserConnected: (userId) => connectedUsers.has(userId)
  };
};

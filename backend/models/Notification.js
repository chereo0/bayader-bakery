const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    actorName: {
      type: String,
      default: null
    },
    type: {
      type: String,
      enum: ['alert', 'info', 'warning', 'success', 'error'],
      default: 'info'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['order', 'production', 'delivery', 'inventory', 'staff', 'system'],
      default: 'system'
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    relatedModel: {
      type: String,
      enum: ['Order', 'ProductionQueue', 'Delivery', 'InventoryAlert', 'User'],
      default: null
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    action: {
      label: String,
      url: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // Auto-delete notifications after 30 days (TTL in seconds)
      index: { expires: 2592000 }
    }
  },
  { timestamps: true }
);

// Index for common queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, priority: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);

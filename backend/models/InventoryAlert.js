const mongoose = require('mongoose');

const inventoryAlertSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  priority: {
    type: String,
    enum: ['critical', 'warning', 'low'],
    default: 'warning'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'acknowledged'],
    default: 'active'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String
  },
  resolvedAt: {
    type: Date
  },
  replenishmentRequested: {
    type: Boolean,
    default: false
  },
  replenishmentRequestedAt: {
    type: Date
  },
  replenishmentRequestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 90 * 24 * 60 * 60 // Auto-delete after 90 days
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
inventoryAlertSchema.index({ product: 1, status: 1 });
inventoryAlertSchema.index({ priority: 1, status: 1 });
inventoryAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('InventoryAlert', inventoryAlertSchema);

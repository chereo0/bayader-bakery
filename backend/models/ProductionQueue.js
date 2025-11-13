const mongoose = require('mongoose');

const ProductionQueueSchema = new mongoose.Schema(
  {
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
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    orderNumber: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'baking', 'decorating', 'quality_check', 'ready', 'completed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedToName: {
      type: String,
      default: null
    },
    startTime: {
      type: Date,
      default: null
    },
    estimatedCompletionTime: {
      type: Date,
      required: true
    },
    actualCompletionTime: {
      type: Date,
      default: null
    },
    stages: [
      {
        stageName: {
          type: String,
          enum: ['preparation', 'baking', 'cooling', 'decorating', 'quality_check', 'packaging'],
          required: true
        },
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed'],
          default: 'pending'
        },
        completedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null
        },
        completedAt: {
          type: Date,
          default: null
        },
        notes: String
      }
    ],
    specialInstructions: String,
    qualityNotes: String,
    batchInfo: {
      batchId: String,
      madeWith: String, // e.g., "Batch A - Flour"
      expiryDate: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for common queries
ProductionQueueSchema.index({ status: 1, priority: -1, createdAt: -1 });
ProductionQueueSchema.index({ orderId: 1 });
ProductionQueueSchema.index({ assignedTo: 1, status: 1 });
ProductionQueueSchema.index({ estimatedCompletionTime: 1 });

module.exports = mongoose.model('ProductionQueue', ProductionQueueSchema);

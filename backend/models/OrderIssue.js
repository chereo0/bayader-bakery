const mongoose = require('mongoose');

const orderIssueSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueType: {
    type: String,
    enum: ['missing_items', 'delay', 'quality_issue', 'customer_change', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolution: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for performance
orderIssueSchema.index({ order: 1, status: 1 });
orderIssueSchema.index({ reportedBy: 1, createdAt: -1 });

module.exports = mongoose.model('OrderIssue', orderIssueSchema);

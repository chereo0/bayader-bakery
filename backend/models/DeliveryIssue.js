const mongoose = require('mongoose');

const deliveryIssueSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueType: {
    type: String,
    enum: [
      'customer-unavailable',
      'wrong-address',
      'access-denied',
      'damaged-product',
      'payment-issue',
      'traffic-delay',
      'vehicle-breakdown',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  photoUrl: {
    type: String,
    default: null
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: null
    }
  },
  status: {
    type: String,
    enum: ['reported', 'investigating', 'resolved', 'escalated'],
    default: 'reported'
  },
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolutionNotes: {
      type: String,
      default: null
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for querying
deliveryIssueSchema.index({ driver: 1, createdAt: -1 });
deliveryIssueSchema.index({ status: 1, priority: -1 });
deliveryIssueSchema.index({ order: 1 });

const DeliveryIssue = mongoose.model('DeliveryIssue', deliveryIssueSchema);

module.exports = DeliveryIssue;

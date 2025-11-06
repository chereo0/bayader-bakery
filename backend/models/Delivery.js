const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional initially
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-transit', 'delivered', 'failed', 'cancelled'],
    default: 'pending',
  },
  estimatedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  deliveryAddress: {
    line1: String,
    line2: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  notes: { type: String },
  latitude: { type: Number }, // For GPS tracking
  longitude: { type: Number },
  attempts: { type: Number, default: 0 },
  failureReason: { type: String }, // Why delivery failed (if applicable)
}, {
  timestamps: true,
});

module.exports = mongoose.model('Delivery', deliverySchema);

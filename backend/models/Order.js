const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  postalCode: { type: String },
  country: { type: String, required: true },
  phone: { type: String, required: true },
});

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryAddress: { type: addressSchema, required: true },
  payment: {
    method: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
    paid: { type: Boolean, default: false },
    transactionId: { type: String },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);

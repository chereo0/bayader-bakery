const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  name: { type: String },
  description: { type: String },
  date: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  time: { type: String },
  venue: { type: String },
  price: { type: String },
  perPersonPrice: { 
    type: Number, 
    required: false, 
    default: null,
    validate: {
      validator: function(v) {
        return v === null || (typeof v === 'number' && v >= 0)
      },
      message: 'perPersonPrice must be a non-negative number or null'
    }
  },
  theme: { type: [String], default: [] },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

EventSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('Event', EventSchema)

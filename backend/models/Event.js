const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  name: { type: String },
  date: { type: String },
  time: { type: String },
  venue: { type: String },
  price: { type: String },
  theme: { type: [String], default: [] },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

EventSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('Event', EventSchema)

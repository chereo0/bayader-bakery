const mongoose = require("mongoose");

const eventBookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    peopleCount: {
      type: Number,
      required: true,
      min: 1,
    },
    dateRequested: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
eventBookingSchema.index({ customerId: 1, createdAt: -1 });
eventBookingSchema.index({ eventId: 1 });
eventBookingSchema.index({ status: 1 });

const EventBooking = mongoose.model("EventBooking", eventBookingSchema);

module.exports = EventBooking;

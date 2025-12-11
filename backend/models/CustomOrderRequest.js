const mongoose = require("mongoose");

const customOrderRequestSchema = new mongoose.Schema(
  {
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
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    budget: {
      type: Number,
      min: 0,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "in-progress", "rejected", "completed"],
      default: "pending",
    },
    estimatedPrice: {
      type: Number,
      min: 0,
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
customOrderRequestSchema.index({ customerId: 1, createdAt: -1 });
customOrderRequestSchema.index({ status: 1 });

const CustomOrderRequest = mongoose.model(
  "CustomOrderRequest",
  customOrderRequestSchema
);

module.exports = CustomOrderRequest;

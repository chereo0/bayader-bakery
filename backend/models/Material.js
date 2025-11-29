const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
      unique: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'g', 'lb', 'oz', 'l', 'ml', 'piece', 'cup', 'tbsp', 'tsp'],
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    reorderLevel: {
      type: Number,
      required: true,
      default: 10,
      min: [0, 'Reorder level cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
    supplier: {
      type: String,
      trim: true,
    },
    unitPrice: {
      type: Number,
      min: [0, 'Unit price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
materialSchema.index({ name: 'text', description: 'text' });
materialSchema.index({ isActive: 1 });
materialSchema.index({ currentStock: 1, reorderLevel: 1 });

// Virtual to check if material is low stock
materialSchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.reorderLevel;
});

// Include virtuals in JSON output
materialSchema.set('toJSON', { virtuals: true });
materialSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Material', materialSchema);
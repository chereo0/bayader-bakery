const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Cakes', 'Pastries', 'Breads', 'Cookies', 'Custom Orders', 'Seasonal'],
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Out of Stock'],
      default: 'Active',
    },
    image: {
      type: String,
      default: '/images/placeholder.jpg',
    },
    images: [
      {
        type: String,
      },
    ],
    ingredients: [
      {
        type: String,
      },
    ],
    recipe: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Material',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [0, 'Quantity must be positive'],
        },
      },
    ],
    reviews: [reviewSchema],
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
productSchema.index({ category: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Auto-update status based on stock
productSchema.pre('save', function (next) {
  if (this.stock === 0 && this.status === 'Active') {
    this.status = 'Out of Stock';
  } else if (this.stock > 0 && this.status === 'Out of Stock') {
    this.status = 'Active';
  }
  next();
});

// Calculate average rating when reviews change
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.reviews.length;
    this.totalReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);

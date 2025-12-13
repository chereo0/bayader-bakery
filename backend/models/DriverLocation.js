const mongoose = require('mongoose');

const driverLocationSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  heading: {
    type: Number, // 0-360 degrees
    default: 0
  },
  speed: {
    type: Number, // km/h
    default: 0
  },
  accuracy: {
    type: Number, // meters
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
driverLocationSchema.index({ location: '2dsphere' });

// Index for finding active drivers
driverLocationSchema.index({ driver: 1, isActive: 1 });

// Method to update location
driverLocationSchema.methods.updateLocation = function(lat, lng, heading, speed, accuracy) {
  this.location.coordinates = [lng, lat];
  this.heading = heading || 0;
  this.speed = speed || 0;
  this.accuracy = accuracy || 0;
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to find nearby drivers
driverLocationSchema.statics.findNearby = function(lat, lng, maxDistance = 10000) {
  return this.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance // meters
      }
    }
  }).populate('driver', 'name phone email');
};

const DriverLocation = mongoose.model('DriverLocation', driverLocationSchema);

module.exports = DriverLocation;

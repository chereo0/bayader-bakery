const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const DriverLocation = require('../models/DriverLocation');

// @route   POST /api/driver/location
// @desc    Update driver's current location
// @access  Private (Driver only)
router.post('/', auth, requireRole('driver'), async (req, res) => {
  try {
    const { latitude, longitude, heading, speed, accuracy } = req.body;
    const driverId = req.user.id;

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Find or create driver location record
    let driverLocation = await DriverLocation.findOne({ driver: driverId });

    if (driverLocation) {
      // Update existing location
      await driverLocation.updateLocation(latitude, longitude, heading, speed, accuracy);
    } else {
      // Create new location record
      driverLocation = await DriverLocation.create({
        driver: driverId,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        heading: heading || 0,
        speed: speed || 0,
        accuracy: accuracy || 0,
        isActive: true
      });
    }

    console.log(`[LOCATION] Driver ${driverId} location updated:`, {
      lat: latitude,
      lng: longitude,
      heading,
      speed
    });

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        latitude,
        longitude,
        heading: driverLocation.heading,
        speed: driverLocation.speed,
        lastUpdated: driverLocation.lastUpdated
      }
    });
  } catch (error) {
    console.error('[LOCATION] Error updating driver location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
});

// @route   GET /api/driver/location/:driverId
// @desc    Get driver's current location (for admin/staff)
// @access  Private (Admin/Staff only)
router.get('/:driverId', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { driverId } = req.params;

    const driverLocation = await DriverLocation.findOne({ 
      driver: driverId,
      isActive: true 
    }).populate('driver', 'name phone email');

    if (!driverLocation) {
      return res.status(404).json({
        success: false,
        message: 'Driver location not found'
      });
    }

    const [lng, lat] = driverLocation.location.coordinates;

    res.json({
      success: true,
      data: {
        driver: driverLocation.driver,
        latitude: lat,
        longitude: lng,
        heading: driverLocation.heading,
        speed: driverLocation.speed,
        accuracy: driverLocation.accuracy,
        lastUpdated: driverLocation.lastUpdated
      }
    });
  } catch (error) {
    console.error('[LOCATION] Error fetching driver location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver location',
      error: error.message
    });
  }
});

// @route   GET /api/driver/location/nearby/:orderId
// @desc    Find nearby drivers for an order
// @access  Private (Admin/Staff only)
router.get('/nearby/:orderId', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { maxDistance = 10000 } = req.query; // Default 10km

    // Get order to find delivery address coordinates
    const Order = require('../models/Order');
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // For now, use a default location (bakery location)
    // In production, you'd geocode the delivery address
    const lat = 24.7136; // Riyadh example
    const lng = 46.6753;

    const nearbyDrivers = await DriverLocation.findNearby(lat, lng, parseInt(maxDistance));

    res.json({
      success: true,
      data: nearbyDrivers.map(dl => {
        const [lng, lat] = dl.location.coordinates;
        return {
          driver: dl.driver,
          latitude: lat,
          longitude: lng,
          heading: dl.heading,
          speed: dl.speed,
          lastUpdated: dl.lastUpdated
        };
      })
    });
  } catch (error) {
    console.error('[LOCATION] Error finding nearby drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby drivers',
      error: error.message
    });
  }
});

// @route   DELETE /api/driver/location
// @desc    Deactivate driver location (when going offline)
// @access  Private (Driver only)
router.delete('/', auth, requireRole('driver'), async (req, res) => {
  try {
    const driverId = req.user.id;

    await DriverLocation.findOneAndUpdate(
      { driver: driverId },
      { isActive: false },
      { new: true }
    );

    console.log(`[LOCATION] Driver ${driverId} went offline`);

    res.json({
      success: true,
      message: 'Location tracking deactivated'
    });
  } catch (error) {
    console.error('[LOCATION] Error deactivating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate location tracking',
      error: error.message
    });
  }
});

module.exports = router;

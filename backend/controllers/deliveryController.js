const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const User = require('../models/User');
const logger = require('../utils/logger');

// Create delivery when order is confirmed
const createDelivery = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name phone email');
    if (!order) return null;

    const delivery = await Delivery.create({
      order: orderId,
      deliveryAddress: order.deliveryAddress,
      status: 'pending',
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    });

    return delivery;
  } catch (err) {
    logger.error('Error creating delivery:', err);
    return null;
  }
};

// Get all deliveries (admin view)
const getAllDeliveries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, driverId } = req.query;
    const q = {};

    if (status) q.status = status;
    if (driverId) q.driver = driverId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const deliveries = await Delivery.find(q)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('order', 'totalAmount status')
      .populate('driver', 'name email phone')
      .lean();

    const total = await Delivery.countDocuments(q);

    res.json({
      success: true,
      data: {
        deliveries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    logger.error('Error fetching deliveries:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch deliveries' });
  }
};

// Get delivery by ID
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('order')
      .populate('driver', 'name email phone');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    res.json({ success: true, data: delivery });
  } catch (err) {
    logger.error('Error fetching delivery:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch delivery' });
  }
};

// Assign driver to delivery
const assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Verify driver exists and has driver role
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(400).json({ success: false, message: 'Invalid driver' });
    }

    delivery.driver = driverId;
    delivery.status = 'assigned';
    await delivery.save();

    await delivery.populate('driver', 'name email phone');
    res.json({ success: true, data: delivery });
  } catch (err) {
    logger.error('Error assigning driver:', err);
    res.status(500).json({ success: false, message: 'Failed to assign driver' });
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, latitude, longitude, failureReason } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const prevStatus = delivery.status;
    delivery.status = status;

    // Update GPS coordinates if provided
    if (latitude && longitude) {
      delivery.latitude = latitude;
      delivery.longitude = longitude;
    }

    // Track delivery attempts
    if (status === 'in-transit' && prevStatus !== 'in-transit') {
      delivery.attempts = (delivery.attempts || 0) + 1;
    }

    // Mark actual delivery date
    if (status === 'delivered') {
      delivery.actualDeliveryDate = new Date();
      // Also update the order status to delivered
      await Order.findByIdAndUpdate(delivery.order, { status: 'delivered' });
    }

    // Record failure reason if delivery failed
    if (status === 'failed' && failureReason) {
      delivery.failureReason = failureReason;
    }

    await delivery.save();
    await delivery.populate('driver', 'name email phone');
    await delivery.populate('order', 'totalAmount status');

    res.json({ success: true, data: delivery });
  } catch (err) {
    logger.error('Error updating delivery status:', err);
    res.status(500).json({ success: false, message: 'Failed to update delivery' });
  }
};

// Get deliveries for a specific driver (driver's perspective)
const getMyDeliveries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const q = { driver: req.user.id };

    if (status) q.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const deliveries = await Delivery.find(q)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('order', 'totalAmount status items')
      .lean();

    const total = await Delivery.countDocuments(q);

    res.json({
      success: true,
      data: {
        deliveries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    logger.error('Error fetching driver deliveries:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch deliveries' });
  }
};

// Get all drivers with their status for staff dashboard
const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' })
      .select('name email phone')
      .lean();

    // Get current deliveries for each driver
    const driversWithDeliveries = await Promise.all(
      drivers.map(async (driver) => {
        const currentDelivery = await Delivery.findOne({
          driver: driver._id,
          status: { $in: ['assigned', 'in-transit'] }
        })
          .populate({
            path: 'order',
            select: 'orderNumber user deliveryAddress',
            populate: {
              path: 'user',
              select: 'name'
            }
          })
          .lean();

        return {
          _id: driver._id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          status: currentDelivery ? 'on-route' : 'available',
          currentOrder: currentDelivery ? {
            _id: currentDelivery._id,
            orderNumber: currentDelivery.order?.orderNumber,
            customerName: currentDelivery.order?.user?.name || 'N/A',
            destination: currentDelivery.order?.deliveryAddress || 'N/A'
          } : null
        };
      })
    );

    logger.info(`Drivers fetched: ${driversWithDeliveries.length} drivers`);

    res.json({
      success: true,
      data: driversWithDeliveries
    });
  } catch (error) {
    logger.error('Error fetching drivers', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get delivery statistics for dashboard
const getDeliveryStats = async (req, res) => {
  try {
    const stats = await Delivery.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsByStatus = {
      pending: 0,
      assigned: 0,
      'in-transit': 0,
      delivered: 0,
      failed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      if (statsByStatus.hasOwnProperty(stat._id)) {
        statsByStatus[stat._id] = stat.count;
      }
    });

    logger.info('Delivery statistics calculated', statsByStatus);

    res.json({
      success: true,
      data: statsByStatus
    });
  } catch (error) {
    logger.error('Error fetching delivery stats', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  assignDriver,
  updateDeliveryStatus,
  getMyDeliveries,
  getDrivers,
  getDeliveryStats,
};

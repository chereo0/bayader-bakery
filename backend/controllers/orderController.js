const Order = require('../models/Order');
const Product = require('../models/Product');

// Create a new order (customer)
const createOrder = async (req, res) => {
  const { items, deliveryAddress, payment } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order items are required' });
  }

  // Fetch products and validate stock
  const productIds = items.map(i => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    return res.status(400).json({ success: false, message: 'One or more products not found' });
  }

  // Build order items and compute total
  let total = 0;
  const orderItems = [];

  for (const reqItem of items) {
    const prod = products.find(p => p._id.toString() === reqItem.productId);
    const qty = parseInt(reqItem.quantity, 10) || 0;

    if (qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity for product' });
    }

    if (prod.stock < qty) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${prod.name}` });
    }

    // Snapshot
    orderItems.push({
      product: prod._id,
      name: prod.name,
      price: prod.price,
      quantity: qty,
      image: prod.image,
    });

    total += prod.price * qty;
  }

  // Deduct stock (simple approach)
  for (const oi of orderItems) {
    const p = products.find(x => x._id.toString() === oi.product.toString());
    p.stock = Math.max(0, p.stock - oi.quantity);
    await p.save();
  }

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalAmount: total,
    deliveryAddress,
    payment,
  });

  res.status(201).json({ success: true, data: order });
};

// Get orders for current user
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt').lean();
  res.json({ success: true, data: orders });
};

// Get order by id (owner or admin/staff/driver)
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email role');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const isOwner = order.user && order.user._id.toString() === req.user.id;
  const allowedRoles = ['admin', 'staff', 'driver'];
  if (!isOwner && !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, data: order });
};

// Admin: get all orders with optional filters
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const q = {};
  if (status) q.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const orders = await Order.find(q).sort('-createdAt').skip(skip).limit(parseInt(limit)).populate('user', 'name email').lean();
  const total = await Order.countDocuments(q);

  res.json({
    success: true,
    data: {
      orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    }
  });
};

// Update order status (admin/staff/driver)
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const prevStatus = order.status;
  order.status = status;
  await order.save();

  // If cancelled and previously pending/confirmed, restore stock
  if (status === 'cancelled' && ['pending', 'confirmed'].includes(prevStatus)) {
    for (const it of order.items) {
      const p = await Product.findById(it.product);
      if (p) {
        p.stock += it.quantity;
        await p.save();
      }
    }
  }

  res.json({ success: true, data: order });
};

// Cancel order by customer (if allowed)
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
  }

  order.status = 'cancelled';
  await order.save();

  // Restore stock
  for (const it of order.items) {
    const p = await Product.findById(it.product);
    if (p) {
      p.stock += it.quantity;
      await p.save();
    }
  }

  res.json({ success: true, data: order });
};

// Get orders for staff dashboard - organized by status
const getStaffOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const logger = require('../utils/logger');

    let filter = {};
    
    // Only show orders that staff need to work on
    if (status && status !== 'all') {
      filter.status = status;
    } else {
      // Default to showing pending, confirmed, and preparing orders
      filter.status = { $in: ['pending', 'confirmed', 'preparing'] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    logger.info(`Staff orders fetched: ${orders.length} items with status filter: ${status || 'default'}`);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    const logger = require('../utils/logger');
    logger.error('Error fetching staff orders', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get order status counts for staff dashboard
const getStaffOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsByStatus = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      'out-for-delivery': 0,
      delivered: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      if (statsByStatus.hasOwnProperty(stat._id)) {
        statsByStatus[stat._id] = stat.count;
      }
    });

    const logger = require('../utils/logger');
    logger.info('Staff order statistics calculated', statsByStatus);

    res.json({
      success: true,
      data: statsByStatus
    });
  } catch (error) {
    const logger = require('../utils/logger');
    logger.error('Error fetching order stats', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getStaffOrders,
  getStaffOrderStats,
};

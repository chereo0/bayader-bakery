const Order = require('../models/Order');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Material = require('../models/Material');
const User = require('../models/User');
const logger = require('../utils/logger');
const { getNextOrderNumber } = require('../utils/orderNumberGenerator');
const { sendOrderCreatedEmail, sendOrderStatusChangedEmail } = require('../services/emailService');

// Validate delivery address
const validateDeliveryAddress = (address) => {
  if (!address) throw new Error('Delivery address is required');
  if (!address.line1 || !address.city || !address.country || !address.phone) {
    throw new Error('Delivery address must include: line1, city, country, phone');
  }
  return true;
};

// Helper function to calculate and deduct materials for an order
const deductMaterialsForOrder = async (order, session = null) => {
  const materialDeductions = new Map();

  // Calculate total material requirements for all order items
  for (const orderItem of order.items) {
    const product = await Product.findById(orderItem.product)
      .populate('recipe.material')
      .session(session);

    if (!product || !product.recipe || product.recipe.length === 0) {
      // Skip products without recipes (existing products without material requirements)
      continue;
    }

    // Calculate required materials for this order item
    for (const recipeItem of product.recipe) {
      const materialId = recipeItem.material._id.toString();
      const requiredQuantity = recipeItem.quantity * orderItem.quantity;

      if (materialDeductions.has(materialId)) {
        materialDeductions.set(materialId, {
          ...materialDeductions.get(materialId),
          requiredQuantity: materialDeductions.get(materialId).requiredQuantity + requiredQuantity,
        });
      } else {
        materialDeductions.set(materialId, {
          material: recipeItem.material,
          requiredQuantity,
        });
      }
    }
  }

  if (materialDeductions.size === 0) {
    // No materials to deduct
    return { success: true, deductions: [] };
  }

  // Check stock availability for all materials
  const insufficientMaterials = [];
  for (const [materialId, deduction] of materialDeductions) {
    const currentStock = deduction.material.currentStock;
    if (currentStock < deduction.requiredQuantity) {
      insufficientMaterials.push({
        name: deduction.material.name,
        required: deduction.requiredQuantity,
        available: currentStock,
        unit: deduction.material.unit,
      });
    }
  }

  if (insufficientMaterials.length > 0) {
    return {
      success: false,
      error: 'Insufficient materials for this order',
      insufficientMaterials,
    };
  }

  // Deduct materials
  const deductions = [];
  for (const [materialId, deduction] of materialDeductions) {
    const material = await Material.findByIdAndUpdate(
      materialId,
      { $inc: { currentStock: -deduction.requiredQuantity } },
      { new: true, session }
    );

    deductions.push({
      materialId,
      name: deduction.material.name,
      deductedQuantity: deduction.requiredQuantity,
      unit: deduction.material.unit,
      newStock: material.currentStock,
    });

    logger.info(`Deducted ${deduction.requiredQuantity} ${deduction.material.unit} of ${deduction.material.name} for order ${order._id}. New stock: ${material.currentStock}`);
  }

  return { success: true, deductions };
};

// Validate payment info
const validatePayment = (payment) => {
  if (!payment) {
    return { method: 'cash', paid: false };
  }
  if (!['cash', 'card', 'online'].includes(payment.method)) {
    throw new Error('Invalid payment method');
  }
  return payment;
};

// Create a new order (customer)
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, payment } = req.body;
    const userId = req.user?.id;

    // Validate userId
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    // Validate delivery address
    validateDeliveryAddress(deliveryAddress);

    // Validate payment
    const validatedPayment = validatePayment(payment);

    // Fetch products and validate existence
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'One or more products not found' });
    }

    // Build and validate order items
    let total = 0;
    const orderItems = [];

    for (const reqItem of items) {
      const prod = products.find(p => p._id.toString() === reqItem.productId);
      const qty = parseInt(reqItem.quantity, 10) || 0;

      // Quantity validation
      if (qty <= 0 || qty > 1000) {
        return res.status(400).json({ success: false, message: `Invalid quantity for ${prod.name}` });
      }

      // Stock validation
      if (prod.stock < qty) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${prod.name}. Available: ${prod.stock}, Requested: ${qty}` 
        });
      }

      // Create order item snapshot
      orderItems.push({
        product: prod._id,
        name: prod.name,
        price: parseFloat(prod.price),
        quantity: qty,
        image: prod.image || null,
      });

      total += prod.price * qty;
    }

    // Validate total
    if (total <= 0) {
      return res.status(400).json({ success: false, message: 'Order total must be greater than zero' });
    }

    // Deduct stock from products
    const stockUpdates = [];
    for (const oi of orderItems) {
      const p = products.find(x => x._id.toString() === oi.product.toString());
      p.stock = Math.max(0, p.stock - oi.quantity);
      stockUpdates.push(p.save().catch(err => {
        logger.error(`Failed to update stock for product ${p._id}`, err);
        throw new Error(`Failed to update stock for ${p.name}`);
      }));
    }
    await Promise.all(stockUpdates);

    // Generate unique orderNumber BEFORE creating order (prevents validation errors)
    const orderNumber = await getNextOrderNumber();
    logger.info(`Generated orderNumber: ${orderNumber}`);

    // Create order document with pre-generated orderNumber
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: total,
      deliveryAddress,
      payment: validatedPayment,
      orderNumber: orderNumber, // Set orderNumber explicitly before save
    });

    // Save order with explicit error handling
    await order.save();

    logger.info(`Order created successfully: ${order._id} with orderNumber: ${order.orderNumber} for user ${userId}`);

    // Send order creation email (don't wait for it)
    try {
      const customer = await User.findById(userId);
      if (customer) {
        sendOrderCreatedEmail(customer, {
          orderId: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          items: order.items,
          estimatedDeliveryTime: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'TBD',
        });
      }
    } catch (emailError) {
      logger.error('Failed to send order creation email:', emailError);
    }

    res.status(201).json({ 
      success: true, 
      data: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      },
      message: 'Order placed successfully' 
    });
  } catch (error) {
    logger.error('Error creating order', error);
    next(error);
  }
};

// Get orders for current user
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const orders = await Order.find({ user: userId })
      .sort('-createdAt')
      .lean();

    logger.info(`Retrieved ${orders.length} orders for user ${userId}`);
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error('Error fetching user orders', error);
    next(error);
  }
};

// Get order by id (owner or admin/staff/driver)
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findById(id).populate('user', 'name email role');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isOwner = order.user && order.user._id.toString() === req.user.id;
    const allowedRoles = ['admin', 'staff', 'driver'];
    
    if (!isOwner && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('Error fetching order by ID', error);
    next(error);
  }
};

// Admin: get all orders with optional filters
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    
    const filter = {};
    if (status) {
      const validStatuses = ['pending', 'active', 'shipped', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status filter' });
      }
      filter.status = status;
    }

    const skip = (pageNum - 1) * limitNum;
    
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email')
      .lean();
    
    const total = await Order.countDocuments(filter);

    logger.info(`Retrieved ${orders.length} orders with filter: ${JSON.stringify(filter)}`);

    res.json({
      success: true,
      data: {
        orders,
        pagination: { 
          page: pageNum, 
          limit: limitNum, 
          total, 
          pages: Math.ceil(total / limitNum) 
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching all orders', error);
    next(error);
  }
};

// Update order status (admin/staff/driver)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Define valid transitions based on user role
    let validTransitions;
    
    if (req.user.role === 'staff') {
      // Staff can only move forward in the bakery workflow
      // pending → active → shipped → delivered
      validTransitions = {
        'pending': ['active'],
        'active': ['shipped'],
        'shipped': ['delivered'],
        'delivered': []
      };
    } else {
      // Admin/Driver have full control (existing behavior)
      validTransitions = {
        'pending': ['active', 'delivered'],
        'active': ['shipped', 'delivered'],
        'shipped': ['delivered'],
        'delivered': []
      };
    }

    if (!validTransitions[order.status]) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid current status: ${order.status}` 
      });
    }

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${order.status}' to '${status}'. Valid transitions: ${validTransitions[order.status].join(', ')}`
      });
    }

    const prevStatus = order.status;
    
    // Handle material deduction when order becomes active
    let materialDeductionResult = null;
    if (status === 'active' && prevStatus !== 'active') {
      const session = await Order.startSession();
      try {
        await session.withTransaction(async () => {
          materialDeductionResult = await deductMaterialsForOrder(order, session);
          
          if (!materialDeductionResult.success) {
            throw new Error(JSON.stringify(materialDeductionResult));
          }

          order.status = status;
          await order.save({ session });
        });
      } catch (error) {
        await session.endSession();
        
        // If it's a material shortage error, return specific error
        if (error.message.startsWith('{')) {
          const errorData = JSON.parse(error.message);
          return res.status(400).json({
            success: false,
            message: errorData.error,
            insufficientMaterials: errorData.insufficientMaterials,
          });
        }
        
        throw error;
      } finally {
        await session.endSession();
      }
    } else {
      // Normal status update without material deduction
      order.status = status;
      await order.save();
    }

    logger.info(`Order ${id} status updated from ${prevStatus} to ${status}`);

    // Send order status change email (don't wait for it)
    try {
      const customer = await User.findById(order.user);
      if (customer && prevStatus !== status) {
        sendOrderStatusChangedEmail(customer, {
          orderId: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          items: order.items,
          estimatedDeliveryTime: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'TBD',
        }, prevStatus, status);
      }
    } catch (emailError) {
      logger.error('Failed to send order status change email:', emailError);
    }

    const response = { 
      success: true, 
      data: order,
      message: `Status updated from ${prevStatus} to ${status}`
    };

    // Include material deduction info in response
    if (materialDeductionResult && materialDeductionResult.deductions) {
      response.materialDeductions = materialDeductionResult.deductions;
    }

    res.json(response);
  } catch (error) {
    logger.error('Error updating order status', error);
    next(error);
  }
};

// Cancel order by customer (if allowed)
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'active'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be cancelled when status is '${order.status}'` 
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore stock
    const stockRestores = [];
    for (const it of order.items) {
      const p = await Product.findById(it.product);
      if (p) {
        p.stock += it.quantity;
        stockRestores.push(p.save().catch(err => {
          logger.error(`Failed to restore stock for ${p._id}`, err);
        }));
      }
    }
    await Promise.all(stockRestores);

    logger.info(`Order ${id} cancelled and stock restored`);

    res.json({ 
      success: true, 
      data: order,
      message: 'Order cancelled and stock restored' 
    });
  } catch (error) {
    logger.error('Error cancelling order', error);
    next(error);
  }
};

// Get orders for staff dashboard - organized by status
const getStaffOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

    let filter = {};
    
    // Only show orders that staff need to work on
    if (status && status !== 'all') {
      const validStatuses = ['pending', 'active', 'shipped', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status filter' });
      }
      filter.status = status;
    } else {
      // Default to showing pending and active orders
      filter.status = { $in: ['pending', 'active'] };
    }

    const skip = (pageNum - 1) * limitNum;
    
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Order.countDocuments(filter);

    logger.info(`Staff orders fetched: ${orders.length} items with status filter: ${status || 'default'}`);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Error fetching staff orders', error);
    next(error);
  }
};

// Get order status counts for staff dashboard
const getStaffOrderStats = async (req, res, next) => {
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
      active: 0,
      shipped: 0,
      delivered: 0
    };

    stats.forEach(stat => {
      if (statsByStatus.hasOwnProperty(stat._id)) {
        statsByStatus[stat._id] = stat.count;
      }
    });

    logger.info('Staff order statistics calculated', statsByStatus);

    res.json({
      success: true,
      data: statsByStatus
    });
  } catch (error) {
    logger.error('Error fetching order stats', error);
    next(error);
  }
};

// Driver: Get orders assigned to current driver
const getDriverOrders = async (req, res, next) => {
  try {
    const driverId = req.user?.id;
    if (!driverId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { page = 1, limit = 20, deliveryStatus } = req.query;
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    
    const filter = { assignedDriver: driverId };
    
    // Optional: filter by delivery status
    if (deliveryStatus) {
      const validStatuses = ['pending', 'assigned', 'in-transit', 'delivered', 'failed'];
      if (!validStatuses.includes(deliveryStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid delivery status filter' });
      }
      filter.deliveryStatus = deliveryStatus;
    }

    const skip = (pageNum - 1) * limitNum;
    
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name phone email')
      .populate('assignedDriver', 'name phone email')
      .lean();
    
    const total = await Order.countDocuments(filter);

    logger.info(`Driver ${driverId} retrieved ${orders.length} assigned orders`);

    res.json({
      success: true,
      data: {
        orders,
        pagination: { 
          page: pageNum, 
          limit: limitNum, 
          total, 
          pages: Math.ceil(total / limitNum) 
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching driver orders', error);
    next(error);
  }
};

// Driver: get today's stats for driver dashboard
const getDriverTodayStats = async (req, res, next) => {
  try {
    const driverId = req.user?.id || req.user?._id;
    if (!driverId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Compute start and end of today (server local timezone)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Total orders assigned to this driver today (created today)
    const todayTotal = await Order.countDocuments({
      assignedDriver: driverId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Completed (delivered) today based on actualDeliveryDate
    const todayDelivered = await Order.countDocuments({
      assignedDriver: driverId,
      deliveryStatus: 'delivered',
      actualDeliveryDate: { $gte: startOfDay, $lte: endOfDay }
    });

    // Active orders (assigned/in-transit) created today
    const todayActive = await Order.countDocuments({
      assignedDriver: driverId,
      deliveryStatus: { $in: ['assigned', 'in-transit'] },
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Pending today (pending delivery) created today
    const todayPending = await Order.countDocuments({
      assignedDriver: driverId,
      deliveryStatus: 'pending',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Earnings for deliveries completed today
    const earningsAgg = await Order.aggregate([
      { $match: {
        assignedDriver: new mongoose.Types.ObjectId(driverId),
        deliveryStatus: 'delivered',
        actualDeliveryDate: { $gte: startOfDay, $lte: endOfDay }
      } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const earningsToday = (earningsAgg[0] && earningsAgg[0].total) ? earningsAgg[0].total : 0;

    // Compose response matching frontend expectations
    const data = {
      completedToday: todayDelivered,
      earningsToday,
      activeOrders: todayActive,
      todayTotal,
      todayPending
    };

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching driver today stats', error);
    next(error);
  }
};

// Driver: Update delivery status for an order
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const driverId = req.user?.id;
    const { id } = req.params;
    const { deliveryStatus, actualDeliveryDate } = req.body;

    if (!driverId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    if (!deliveryStatus) {
      return res.status(400).json({ success: false, message: 'Delivery status is required' });
    }

    // Validate delivery status
    const validStatuses = ['pending', 'assigned', 'in-transit', 'delivered', 'failed'];
    if (!validStatuses.includes(deliveryStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery status' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only driver assigned to this order can update it
    if (order.assignedDriver?.toString() !== driverId) {
      return res.status(403).json({ success: false, message: 'Not assigned to this order' });
    }

    // Validate delivery status transition
    const validTransitions = {
      'pending': ['assigned', 'in-transit', 'failed'],
      'assigned': ['in-transit', 'failed'],
      'in-transit': ['delivered', 'failed'],
      'delivered': [],
      'failed': ['in-transit'] // Can retry
    };

    if (!validTransitions[order.deliveryStatus]) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid current delivery status: ${order.deliveryStatus}` 
      });
    }

    if (!validTransitions[order.deliveryStatus].includes(deliveryStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${order.deliveryStatus}' to '${deliveryStatus}'. Valid transitions: ${validTransitions[order.deliveryStatus].join(', ')}`
      });
    }

    // Update delivery status
    const prevDeliveryStatus = order.deliveryStatus;
    order.deliveryStatus = deliveryStatus;

    // Set actual delivery date if delivery status is 'delivered'
    if (deliveryStatus === 'delivered') {
      order.actualDeliveryDate = actualDeliveryDate ? new Date(actualDeliveryDate) : new Date();
      // Also update order status to 'delivered'
      order.status = 'delivered';
    }

    await order.save();

    logger.info(`Order ${id} delivery status updated from ${prevDeliveryStatus} to ${deliveryStatus} by driver ${driverId}`);

    res.json({ 
      success: true, 
      data: order,
      message: `Delivery status updated from ${prevDeliveryStatus} to ${deliveryStatus}` 
    });
  } catch (error) {
    logger.error('Error updating delivery status', error);
    next(error);
  }
};

// Admin/Staff: Assign order to driver
const assignOrderToDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { driverId, estimatedDeliveryDate } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    if (!driverId) {
      return res.status(400).json({ success: false, message: 'Driver ID is required' });
    }

    // Verify driver exists and has driver role
    const User = require('../models/User');
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(400).json({ success: false, message: 'Invalid driver' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only assign if order status is 'shipped' (ready for delivery)
    if (order.status !== 'shipped') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot assign driver to order with status '${order.status}'. Order must be 'shipped'` 
      });
    }

    order.assignedDriver = driverId;
    order.deliveryStatus = 'assigned';
    if (estimatedDeliveryDate) {
      order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    }

    await order.save();
    await order.populate('assignedDriver', 'name phone email');

    logger.info(`Order ${id} assigned to driver ${driverId}`);

    res.json({ 
      success: true, 
      data: order,
      message: 'Order assigned to driver successfully' 
    });
  } catch (error) {
    logger.error('Error assigning driver to order', error);
    next(error);
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
  getDriverOrders,
  getDriverTodayStats,
  updateDeliveryStatus,
  assignOrderToDriver,
};

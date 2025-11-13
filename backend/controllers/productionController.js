const ProductionQueue = require('../models/ProductionQueue');
const User = require('../models/User');
const Order = require('../models/Order');
const logger = require('../utils/logger');

// Get production queue with filtering and sorting
exports.getQueue = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20, sort = '-priority,-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;

    const queue = await ProductionQueue.find(filter)
      .populate('product', 'name category')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProductionQueue.countDocuments(filter);

    logger.info(`Production queue fetched: ${queue.length} items`, { status, priority });

    res.json({
      success: true,
      data: queue,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching production queue', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get production statistics/summary
exports.getStats = async (req, res) => {
  try {
    const stats = await ProductionQueue.aggregate([
      {
        $match: { status: { $ne: 'completed' } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await ProductionQueue.aggregate([
      {
        $match: { status: { $ne: 'completed' } }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalPending = await ProductionQueue.countDocuments({ status: { $ne: 'completed' } });
    const totalOverdue = await ProductionQueue.countDocuments({
      estimatedCompletionTime: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    logger.info('Production statistics calculated', { totalPending, totalOverdue });

    res.json({
      success: true,
      data: {
        byStatus: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        byPriority: priorityStats.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {}),
        totalPending,
        totalOverdue,
        onTime: totalPending - totalOverdue
      }
    });
  } catch (error) {
    logger.error('Error fetching production stats', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new production task
exports.createTask = async (req, res) => {
  try {
    const { productId, productName, category, quantity, orderId, priority, estimatedCompletionTime, specialInstructions } = req.body;

    if (!productId || !productName || !category || !quantity || !estimatedCompletionTime) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Get order number if orderId provided
    let orderNumber = null;
    if (orderId) {
      const order = await Order.findById(orderId).select('orderNumber');
      if (order) orderNumber = order.orderNumber;
    }

    const task = new ProductionQueue({
      product: productId,
      productName,
      category,
      quantity,
      orderId: orderId || null,
      orderNumber,
      priority: priority || 'normal',
      estimatedCompletionTime,
      specialInstructions: specialInstructions || '',
      createdBy: req.user._id
    });

    await task.save();
    await task.populate('product', 'name category');
    await task.populate('assignedTo', 'name email');

    logger.info(`Production task created: ${task._id}`, { productName, quantity });

    res.status(201).json({
      success: true,
      message: 'Production task created successfully',
      data: task
    });
  } catch (error) {
    logger.error('Error creating production task', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update task status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['pending', 'baking', 'decorating', 'quality_check', 'ready', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const task = await ProductionQueue.findByIdAndUpdate(
      id,
      {
        status,
        ...(notes && { qualityNotes: notes }),
        ...(status === 'baking' && !('startTime' in this) && { startTime: new Date() }),
        ...(status === 'completed' && { actualCompletionTime: new Date() })
      },
      { new: true }
    )
      .populate('product', 'name category')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    logger.info(`Production task status updated: ${id}`, { status });

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    logger.error('Error updating production task status', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark task as ready
exports.markReady = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const task = await ProductionQueue.findByIdAndUpdate(
      id,
      {
        status: 'ready',
        actualCompletionTime: new Date(),
        ...(notes && { qualityNotes: notes })
      },
      { new: true }
    )
      .populate('product', 'name category')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    logger.info(`Production task marked as ready: ${id}`, { productName: task.productName });

    res.json({
      success: true,
      message: 'Task marked as ready successfully',
      data: task
    });
  } catch (error) {
    logger.error('Error marking task as ready', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Assign staff to task
exports.assignStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({ success: false, error: 'Staff ID is required' });
    }

    const staff = await User.findById(staffId).select('name email role');
    if (!staff) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }

    const task = await ProductionQueue.findByIdAndUpdate(
      id,
      {
        assignedTo: staffId,
        assignedToName: staff.name
      },
      { new: true }
    )
      .populate('product', 'name category')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    logger.info(`Production task assigned to staff: ${id}`, { staffId, staffName: staff.name });

    res.json({
      success: true,
      message: 'Task assigned successfully',
      data: task
    });
  } catch (error) {
    logger.error('Error assigning task to staff', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get task details with history
exports.getTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await ProductionQueue.findById(id)
      .populate('product')
      .populate('assignedTo', 'name email')
      .populate('orderId')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    logger.info(`Production task details fetched: ${id}`);

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    logger.error('Error fetching task details', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk update statuses
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { taskIds, status } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0 || !status) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
    }

    const result = await ProductionQueue.updateMany(
      { _id: { $in: taskIds } },
      {
        status,
        ...(status === 'completed' && { actualCompletionTime: new Date() })
      }
    );

    logger.info(`Bulk status update completed`, { count: result.modifiedCount, status });

    res.json({
      success: true,
      message: `${result.modifiedCount} tasks updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    logger.error('Error in bulk status update', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get batch information for a task
exports.getBatchInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await ProductionQueue.findById(id).select('batchInfo stages productName quantity');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.json({
      success: true,
      data: {
        productName: task.productName,
        quantity: task.quantity,
        batchInfo: task.batchInfo,
        stages: task.stages
      }
    });
  } catch (error) {
    logger.error('Error fetching batch info', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const OrderIssue = require('../models/OrderIssue');
const Order = require('../models/Order');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   POST /api/order-issues
// @desc    Create order issue
// @access  Private (Admin/Staff)
exports.createOrderIssue = async (req, res) => {
  try {
    const { orderId, issueType, description } = req.body;
    
    // Validate required fields
    if (!orderId || !issueType || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID, issue type, and description are required' 
      });
    }
    
    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Create issue
    const issue = await OrderIssue.create({
      order: orderId,
      reportedBy: req.user.userId,
      issueType,
      description
    });
    
    // Auto-notify admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      const issueTypeLabels = {
        'missing_items': 'Missing Items',
        'delay': 'Delay',
        'quality_issue': 'Quality Issue',
        'customer_change': 'Customer Change Request',
        'other': 'Other Issue'
      };
      
      await Message.create({
        from: req.user.userId,
        to: admin._id,
        subject: `⚠️ Order Issue: ${issueTypeLabels[issueType]} - Order #${order.orderNumber}`,
        message: `An issue has been reported for Order #${order.orderNumber}:\n\n**Issue Type:** ${issueTypeLabels[issueType]}\n**Description:** ${description}\n\n**Order Details:**\n- Order ID: ${order._id}\n- Status: ${order.status}\n- Total Amount: $${order.totalAmount}\n\nPlease review and take action immediately.`,
        isRead: false
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Issue reported successfully. Admin has been notified.',
      data: issue 
    });
  } catch (error) {
    console.error('Create order issue error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error creating order issue'
    });
  }
};

// @route   GET /api/order-issues/order/:orderId
// @desc    Get issues for specific order
// @access  Private (Admin/Staff)
exports.getOrderIssues = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const issues = await OrderIssue.find({ order: orderId })
      .populate('reportedBy', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ 
      success: true, 
      data: issues 
    });
  } catch (error) {
    console.error('Get order issues error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error fetching order issues'
    });
  }
};

// @route   PATCH /api/order-issues/:id
// @desc    Update order issue status
// @access  Private (Admin)
exports.updateOrderIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    
    const issue = await OrderIssue.findById(id);
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      });
    }
    
    // Update status if provided
    if (status) {
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
      issue.status = status;
    }
    
    // Update resolution if provided
    if (resolution) {
      issue.resolution = resolution;
      issue.resolvedBy = req.user.userId;
      issue.resolvedAt = new Date();
      if (!status || status === 'open') {
        issue.status = 'resolved';
      }
    }
    
    await issue.save();
    await issue.populate('reportedBy', 'name email');
    await issue.populate('resolvedBy', 'name email');
    
    res.json({ 
      success: true, 
      message: 'Issue updated successfully',
      data: issue 
    });
  } catch (error) {
    console.error('Update order issue error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error updating order issue'
    });
  }
};

// @route   GET /api/order-issues
// @desc    Get all issues (with filters)
// @access  Private (Admin)
exports.getAllIssues = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    
    const issues = await OrderIssue.find(filter)
      .populate('order', 'orderNumber status totalAmount')
      .populate('reportedBy', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const total = await OrderIssue.countDocuments(filter);
    
    res.json({ 
      success: true, 
      data: issues,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all issues error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error fetching issues'
    });
  }
};
